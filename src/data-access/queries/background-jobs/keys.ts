export const backgroundJobKeys = {
  all: ["background-jobs"] as const,
  lists: () => [...backgroundJobKeys.all, "list"] as const,
  list: (limit: number) => [...backgroundJobKeys.lists(), { limit }] as const,
  details: () => [...backgroundJobKeys.all, "detail"] as const,
  detail: (jobId: number) => [...backgroundJobKeys.details(), jobId] as const,
};
