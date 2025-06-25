export interface LogEntry {
  timeStamp: string;
  level: string;
  message: string;
}

export interface LogResponse {
  client_Username: string | null;
  logs: LogEntry[];
  isSuccess: boolean;
} 
export interface LogData {
  logInfos: LogResponse[];
  totalCount: number;
}