import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { Query, queriesState } from "../state";

export const useQuery = () => {
  const [queries, setQueries] = useRecoilState(queriesState);

  const addQuery = useCallback((query: Query): void => {
    setQueries((prev) => {
      return [
        ...prev,
        query,
      ];
    });
  }, [setQueries]);

  const addContent = useCallback((queryUuid: string, contentUuid: string): void => {
    setQueries((prev) => {
      return prev.map((query) => {
        if (query.uuid !== queryUuid) {
          return query;
        }
        const contents = query.contents.slice();
        contents.push(contentUuid);
        return {
          ...query,
          contents,
        };
      });
    });
  }, [setQueries]);

  const findQueryByUuid = useCallback((uuid: string): Query | null => {
    return queries.find(query => query.uuid === uuid) || null;
  }, [queries]);

  return {
    addQuery,
    addContent,
    findQueryByUuid,
    queries,
  };
};
