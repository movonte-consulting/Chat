import { Assistant } from './assistant.model';

export interface AssistantWithStatus extends Assistant {
  isActive: boolean;
  isGlobalActive: boolean;
}
