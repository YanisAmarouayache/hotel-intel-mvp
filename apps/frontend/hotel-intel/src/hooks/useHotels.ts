import { useQuery } from '@apollo/client';
import { GET_HOTELS } from '../graphql/queries';
import type { Hotel } from '../types';

export const useHotels = () => {
  const { loading, error, data, refetch } = useQuery(GET_HOTELS);

  return {
    hotels: (data?.hotels || []) as Hotel[],
    loading,
    error,
    refetch,
  };
}; 