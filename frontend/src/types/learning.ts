export interface Mission {
  id: string;
  type: "daily" | "review";
  title: string;
  description: string;
  progress: number;
  total: number;
  icon: string;
  locked?: boolean;
  requirement?: string;
}

export interface Topic {
  id: string;
  name: string;
  progress: number;
  total: number;
  icon: string;
}

export interface WordLevel {
  level: string;
  count: number;
  label: string;
}
export interface SubTopic {
  id: string;
  name: string;
  progress: number;
  total: number;
  icon: string;
}

export interface TopicList {
  id: number;
  name: string;
  totalTopics: number;
  progressPercent: number;
  subTopics: SubTopic[];
}
export interface Word {
  id: string;
  word: string;
  status: "not-learned" | "learning" | "mastered";
}

export interface GameType {
  id: string;
  name: string;
  enabled: boolean;
}

export interface TopicDetailData {
  id: string;
  name: string;
  icon: string;
  progress: number;
  total: number;
  words: Word[];
}
