import { useEffect, useRef, useState } from "react";

export function useDataTableFilterQuery(query: string) {
  const [filterQuery, setFilterQuery] = useState(query);
  const previousQuery = useRef(query);

  useEffect(() => {
    if (previousQuery.current === query) {
      return;
    }

    previousQuery.current = query;
    setFilterQuery(query);
  }, [query]);

  return [filterQuery, setFilterQuery] as const;
}
