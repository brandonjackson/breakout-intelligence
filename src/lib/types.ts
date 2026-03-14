export interface EventConfig {
  events: EventDef[];
}

export interface EventDef {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'finished';
  participants: ParticipantDef[];
  sessions: SessionDef[];
}

export interface ParticipantDef {
  slug: string;
}

export interface SessionDef {
  id: string;
  name: string;
  type: 'plenary' | 'breakout';
  status: 'draft' | 'open' | 'closed';
  order: number;
  groups?: GroupDef[];
  questions: QuestionDef[];
}

export interface GroupDef {
  id: string;
  name: string;
}

export interface QuestionDef {
  id: string;
  prompt: string;
  likert_labels: string[];
}

export interface StoredResponse {
  groupId: string | null;
  answers: Record<string, number>;
  submittedAt: string;
}

export interface StoredGroups {
  [sessionId: string]: string;
}
