// Uses react-native-sse so the SAME EventSource-style code runs on web,
// iOS, and Android (React Native's fetch can't stream response bodies
// reliably on native, and there's no built-in EventSource on native).
import EventSource from 'react-native-sse';

export type StepKey = 'search' | 'read' | 'write' | 'critique';

export interface StepStartPayload {
  step: StepKey;
  label: string;
}

export interface StepDonePayload {
  step: StepKey;
  output: string;
}

export interface CompletePayload {
  report: string;
  feedback: string;
}

interface Handlers {
  onStepStart: (payload: StepStartPayload) => void;
  onStepDone: (payload: StepDonePayload) => void;
  onComplete: (payload: CompletePayload) => void;
  onError: (message: string) => void;
}

/**
 * Kicks off a research run against the backend and streams progress.
 * Returns a function you can call to cancel/close the connection early.
 */
export function runResearch(baseUrl: string, topic: string, handlers: Handlers): () => void {
  const url = `${baseUrl.replace(/\/$/, '')}/research/stream?topic=${encodeURIComponent(topic)}`;

  const es = new EventSource(url, {
    // keep the connection open only as long as we need it
    pollingInterval: 0,
  });

  es.addEventListener('step_start', (event: any) => {
    try {
      handlers.onStepStart(JSON.parse(event.data));
    } catch {
      /* ignore malformed frame */
    }
  });

  es.addEventListener('step_done', (event: any) => {
    try {
      handlers.onStepDone(JSON.parse(event.data));
    } catch {
      /* ignore malformed frame */
    }
  });

  es.addEventListener('complete', (event: any) => {
    try {
      handlers.onComplete(JSON.parse(event.data));
    } finally {
      es.close();
    }
  });

  es.addEventListener('error', (event: any) => {
    let message = 'Connection to the research server was lost.';
    try {
      if (event?.data) message = JSON.parse(event.data).message ?? message;
    } catch {
      /* keep default message */
    }
    handlers.onError(message);
    es.close();
  });

  return () => es.close();
}
