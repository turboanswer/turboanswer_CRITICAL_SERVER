// Veo video generation via Google Generative AI REST API
// Tries veo-3.0-generate-preview first, falls back to veo-2.0-generate-001

const VEO_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const VEO_MODELS = ['veo-3.0-generate-preview', 'veo-2.0-generate-001'];

export interface VeoJobResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoDataUrl?: string;
  model?: string;
  error?: string;
}

// In-memory job store (TTL 30 minutes)
const jobs = new Map<string, { operationName: string; model: string; createdAt: number }>();

function makeJobId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function startVeoGeneration(params: {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  durationSeconds: 5 | 8;
}): Promise<{ jobId: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  let lastError: string = 'All Veo models failed';

  for (const model of VEO_MODELS) {
    try {
      const url = `${VEO_BASE}/models/${model}:predictLongRunning?key=${apiKey}`;
      const body = {
        instances: [{ prompt: params.prompt }],
        parameters: {
          aspectRatio: params.aspectRatio,
          durationSeconds: params.durationSeconds,
          sampleCount: 1,
          personGeneration: 'allow_adult',
        },
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });

      if (!resp.ok) {
        const text = await resp.text();
        lastError = `${model}: ${text}`;
        console.warn(`[Veo] ${model} failed (${resp.status}):`, text.slice(0, 200));
        continue;
      }

      const data: any = await resp.json();
      const operationName: string = data.name;
      if (!operationName) {
        lastError = `${model}: no operation name in response`;
        continue;
      }

      const jobId = makeJobId();
      jobs.set(jobId, { operationName, model, createdAt: Date.now() });
      cleanOldJobs();
      return { jobId, model };
    } catch (e: any) {
      lastError = `${model}: ${e.message}`;
      console.warn(`[Veo] ${model} exception:`, e.message);
    }
  }

  throw new Error(lastError);
}

export async function pollVeoStatus(jobId: string): Promise<VeoJobResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { status: 'failed', error: 'GEMINI_API_KEY not configured' };

  const job = jobs.get(jobId);
  if (!job) return { status: 'failed', error: 'Job not found or expired' };

  try {
    const url = `${VEO_BASE}/${job.operationName}?key=${apiKey}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!resp.ok) {
      const text = await resp.text();
      return { status: 'failed', error: `Poll error: ${text.slice(0, 200)}` };
    }

    const data: any = await resp.json();

    if (!data.done) {
      return { status: 'processing', model: job.model };
    }

    if (data.error) {
      jobs.delete(jobId);
      return { status: 'failed', error: data.error.message || 'Generation failed', model: job.model };
    }

    // Extract video URI — can be base64 data URI or raw bytes
    const samples =
      data.response?.generateVideoResponse?.generatedSamples ||
      data.response?.generatedSamples ||
      [];

    if (!samples.length) {
      jobs.delete(jobId);
      return { status: 'failed', error: 'No video samples in response', model: job.model };
    }

    const videoUri: string = samples[0]?.video?.uri || '';

    if (!videoUri) {
      jobs.delete(jobId);
      return { status: 'failed', error: 'Empty video URI in response', model: job.model };
    }

    // If already a data URL, use directly; otherwise assume base64 and wrap it
    const videoDataUrl = videoUri.startsWith('data:')
      ? videoUri
      : `data:video/mp4;base64,${videoUri}`;

    jobs.delete(jobId);
    return { status: 'completed', videoDataUrl, model: job.model };
  } catch (e: any) {
    return { status: 'failed', error: e.message, model: job.model };
  }
}

function cleanOldJobs() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, job] of jobs.entries()) {
    if (job.createdAt < cutoff) jobs.delete(id);
  }
}
