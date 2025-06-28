import { useQuery } from '@apollo/client';
import { GET_HOTELS } from '../graphql/queries';

export interface Hotel {
  id: number;
  name: string;
  city: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export const useHotels = () => {
  const { loading, error, data, refetch } = useQuery(GET_HOTELS);

  return {
    hotels: data?.hotels || [],
    loading,
    error,
    refetch,
  };
}; 