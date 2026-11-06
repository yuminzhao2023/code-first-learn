import type { ComponentType } from 'react';
import type { IconName } from '../components/ui/Icon';
import { TraceExplorer } from '../pages/TraceExplorer';
import { LlmMetrics } from '../pages/LlmMetrics';
import { ErrorAnalysis } from '../pages/ErrorAnalysis/ErrorAnalysis';

interface PageRoute {
  id: string;
  path: string;
  Component: ComponentType;
  handle: {
    label: string;
    breadcrumb: string;
    icon: IconName;
  };
}

// Page registration, sidebar navigation, and breadcrumbs share one definition.
export const pageRoutes = [
  { id: 'traces', path: '/', Component: TraceExplorer, handle: { label: 'Trace Explorer', breadcrumb: 'Traces', icon: 'layers' } },
  { id: 'metrics', path: '/metrics', Component: LlmMetrics, handle: { label: 'LLM Metrics', breadcrumb: 'Metrics', icon: 'chart' } },
  { id: 'errors', path: '/errors', Component: ErrorAnalysis, handle: { label: 'Error Analysis', breadcrumb: 'Error Analysis', icon: 'shield' } },
] satisfies PageRoute[];
