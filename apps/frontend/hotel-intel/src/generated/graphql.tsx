import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type BatchScrapingResult = {
  __typename?: 'BatchScrapingResult';
  message: Scalars['String']['output'];
  results: Array<BatchScrapingResultItem>;
  stored: Scalars['Int']['output'];
};

export type BatchScrapingResultItem = {
  __typename?: 'BatchScrapingResultItem';
  data?: Maybe<Scalars['JSON']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  hotelId: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  url: Scalars['String']['output'];
};

export type DailyPrice = {
  __typename?: 'DailyPrice';
  availability: Scalars['Boolean']['output'];
  currency: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  hotelId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  price: Scalars['Float']['output'];
  roomCategory?: Maybe<Scalars['String']['output']>;
  roomCategoryId?: Maybe<Scalars['Int']['output']>;
  scrapedAt: Scalars['DateTime']['output'];
};

export type DashboardStat = {
  __typename?: 'DashboardStat';
  color: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  title: Scalars['String']['output'];
  trend?: Maybe<Trend>;
  value: Scalars['String']['output'];
};

export type Hotel = {
  __typename?: 'Hotel';
  address?: Maybe<Scalars['String']['output']>;
  amenities?: Maybe<Array<Scalars['String']['output']>>;
  city: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  dailyPrices?: Maybe<Array<DailyPrice>>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  isCompetitor: Scalars['Boolean']['output'];
  latestPrice?: Maybe<DailyPrice>;
  latestPriceAtDate?: Maybe<DailyPrice>;
  name: Scalars['String']['output'];
  previousPrice?: Maybe<DailyPrice>;
  previousPriceAtDate?: Maybe<DailyPrice>;
  reviewCount?: Maybe<Scalars['Int']['output']>;
  roomCategories?: Maybe<Array<RoomCategory>>;
  starRating?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  userRating?: Maybe<Scalars['Float']['output']>;
};


export type HotelLatestPriceAtDateArgs = {
  date: Scalars['String']['input'];
};


export type HotelPreviousPriceAtDateArgs = {
  date: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createHotel: Hotel;
  deleteHotel: Hotel;
  scrapeAndStoreBatch: BatchScrapingResult;
  updateHotel: Hotel;
};


export type MutationCreateHotelArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  city: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isCompetitor?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  reviewCount?: InputMaybe<Scalars['Int']['input']>;
  starRating?: InputMaybe<Scalars['Float']['input']>;
  url: Scalars['String']['input'];
  userRating?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationDeleteHotelArgs = {
  id: Scalars['Int']['input'];
};


export type MutationScrapeAndStoreBatchArgs = {
  hotelIds: Array<Scalars['Int']['input']>;
};


export type MutationUpdateHotelArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  city?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isCompetitor?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  reviewCount?: InputMaybe<Scalars['Int']['input']>;
  starRating?: InputMaybe<Scalars['Float']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  userRating?: InputMaybe<Scalars['Float']['input']>;
};

export type Query = {
  __typename?: 'Query';
  dashboardStats: Array<DashboardStat>;
  hotel?: Maybe<Hotel>;
  hotels: Array<Hotel>;
  hotelsWithPricesByDate: Array<Hotel>;
};


export type QueryHotelArgs = {
  id: Scalars['Int']['input'];
};


export type QueryHotelsWithPricesByDateArgs = {
  date: Scalars['String']['input'];
};

export type RoomCategory = {
  __typename?: 'RoomCategory';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  hotelId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Trend = {
  __typename?: 'Trend';
  isPositive: Scalars['Boolean']['output'];
  value: Scalars['Float']['output'];
};

export type GetHotelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHotelsQuery = { __typename?: 'Query', hotels: Array<{ __typename?: 'Hotel', id: number, name: string, city: string, address?: string | null, starRating?: number | null, userRating?: number | null, reviewCount?: number | null, description?: string | null, amenities?: Array<string> | null, images?: Array<string> | null, isCompetitor: boolean, url: string, createdAt: any, updatedAt: any, dailyPrices?: Array<{ __typename?: 'DailyPrice', id: number, date: any, price: number, currency: string, availability: boolean, roomCategoryId?: number | null, scrapedAt: any }> | null, roomCategories?: Array<{ __typename?: 'RoomCategory', id: number, name: string, description?: string | null }> | null }> };

export type GetHotelQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetHotelQuery = { __typename?: 'Query', hotel?: { __typename?: 'Hotel', id: number, name: string, city: string, address?: string | null, starRating?: number | null, userRating?: number | null, reviewCount?: number | null, description?: string | null, amenities?: Array<string> | null, images?: Array<string> | null, isCompetitor: boolean, url: string, createdAt: any, updatedAt: any, dailyPrices?: Array<{ __typename?: 'DailyPrice', id: number, date: any, price: number, currency: string, availability: boolean, roomCategoryId?: number | null, scrapedAt: any }> | null, roomCategories?: Array<{ __typename?: 'RoomCategory', id: number, name: string, description?: string | null }> | null } | null };

export type CreateHotelMutationVariables = Exact<{
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
  city: Scalars['String']['input'];
  address?: InputMaybe<Scalars['String']['input']>;
  starRating?: InputMaybe<Scalars['Float']['input']>;
  userRating?: InputMaybe<Scalars['Float']['input']>;
  reviewCount?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  amenities?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  isCompetitor?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CreateHotelMutation = { __typename?: 'Mutation', createHotel: { __typename?: 'Hotel', id: number, name: string, city: string, address?: string | null, starRating?: number | null, userRating?: number | null, reviewCount?: number | null, description?: string | null, amenities?: Array<string> | null, images?: Array<string> | null, isCompetitor: boolean, url: string, createdAt: any, updatedAt: any, dailyPrices?: Array<{ __typename?: 'DailyPrice', id: number, date: any, price: number, currency: string, availability: boolean, roomCategoryId?: number | null, scrapedAt: any }> | null, roomCategories?: Array<{ __typename?: 'RoomCategory', id: number, name: string, description?: string | null }> | null } };

export type UpdateHotelMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  starRating?: InputMaybe<Scalars['Float']['input']>;
  userRating?: InputMaybe<Scalars['Float']['input']>;
  reviewCount?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  amenities?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  isCompetitor?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateHotelMutation = { __typename?: 'Mutation', updateHotel: { __typename?: 'Hotel', id: number, name: string, city: string, address?: string | null, starRating?: number | null, userRating?: number | null, reviewCount?: number | null, description?: string | null, amenities?: Array<string> | null, images?: Array<string> | null, isCompetitor: boolean, url: string, createdAt: any, updatedAt: any, dailyPrices?: Array<{ __typename?: 'DailyPrice', id: number, date: any, price: number, currency: string, availability: boolean, roomCategoryId?: number | null, scrapedAt: any }> | null, roomCategories?: Array<{ __typename?: 'RoomCategory', id: number, name: string, description?: string | null }> | null } };

export type DeleteHotelMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteHotelMutation = { __typename?: 'Mutation', deleteHotel: { __typename?: 'Hotel', id: number, name: string } };

export type GetDashboardStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDashboardStatsQuery = { __typename?: 'Query', dashboardStats: Array<{ __typename?: 'DashboardStat', title: string, value: string, icon: string, color: string, trend?: { __typename?: 'Trend', value: number, isPositive: boolean } | null }> };

export type LatestPricesQueryVariables = Exact<{ [key: string]: never; }>;


export type LatestPricesQuery = { __typename?: 'Query', hotels: Array<{ __typename?: 'Hotel', id: number, name: string, isCompetitor: boolean, latestPrice?: { __typename?: 'DailyPrice', price: number, date: any, scrapedAt: any } | null, previousPrice?: { __typename?: 'DailyPrice', price: number, date: any, scrapedAt: any } | null }> };

export type ScrapeAndStoreBatchMutationVariables = Exact<{
  hotelIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;


export type ScrapeAndStoreBatchMutation = { __typename?: 'Mutation', scrapeAndStoreBatch: { __typename?: 'BatchScrapingResult', stored: number, message: string, results: Array<{ __typename?: 'BatchScrapingResultItem', hotelId: number, success: boolean, error?: string | null }> } };

export type HotelsWithPricesByDateQueryVariables = Exact<{
  date: Scalars['String']['input'];
}>;


export type HotelsWithPricesByDateQuery = { __typename?: 'Query', hotelsWithPricesByDate: Array<{ __typename?: 'Hotel', id: number, name: string, isCompetitor: boolean, latestPriceAtDate?: { __typename?: 'DailyPrice', scrapedAt: any, price: number } | null, previousPriceAtDate?: { __typename?: 'DailyPrice', price: number, scrapedAt: any } | null }> };


export const GetHotelsDocument = gql`
    query GetHotels {
  hotels {
    id
    name
    city
    address
    starRating
    userRating
    reviewCount
    description
    amenities
    images
    isCompetitor
    url
    dailyPrices {
      id
      date
      price
      currency
      availability
      roomCategoryId
      scrapedAt
    }
    roomCategories {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetHotelsQuery__
 *
 * To run a query within a React component, call `useGetHotelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHotelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHotelsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetHotelsQuery(baseOptions?: Apollo.QueryHookOptions<GetHotelsQuery, GetHotelsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHotelsQuery, GetHotelsQueryVariables>(GetHotelsDocument, options);
      }
export function useGetHotelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHotelsQuery, GetHotelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHotelsQuery, GetHotelsQueryVariables>(GetHotelsDocument, options);
        }
export function useGetHotelsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHotelsQuery, GetHotelsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHotelsQuery, GetHotelsQueryVariables>(GetHotelsDocument, options);
        }
export type GetHotelsQueryHookResult = ReturnType<typeof useGetHotelsQuery>;
export type GetHotelsLazyQueryHookResult = ReturnType<typeof useGetHotelsLazyQuery>;
export type GetHotelsSuspenseQueryHookResult = ReturnType<typeof useGetHotelsSuspenseQuery>;
export type GetHotelsQueryResult = Apollo.QueryResult<GetHotelsQuery, GetHotelsQueryVariables>;
export const GetHotelDocument = gql`
    query GetHotel($id: Int!) {
  hotel(id: $id) {
    id
    name
    city
    address
    starRating
    userRating
    reviewCount
    description
    amenities
    images
    isCompetitor
    url
    dailyPrices {
      id
      date
      price
      currency
      availability
      roomCategoryId
      scrapedAt
    }
    roomCategories {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetHotelQuery__
 *
 * To run a query within a React component, call `useGetHotelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHotelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHotelQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetHotelQuery(baseOptions: Apollo.QueryHookOptions<GetHotelQuery, GetHotelQueryVariables> & ({ variables: GetHotelQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHotelQuery, GetHotelQueryVariables>(GetHotelDocument, options);
      }
export function useGetHotelLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHotelQuery, GetHotelQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHotelQuery, GetHotelQueryVariables>(GetHotelDocument, options);
        }
export function useGetHotelSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetHotelQuery, GetHotelQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetHotelQuery, GetHotelQueryVariables>(GetHotelDocument, options);
        }
export type GetHotelQueryHookResult = ReturnType<typeof useGetHotelQuery>;
export type GetHotelLazyQueryHookResult = ReturnType<typeof useGetHotelLazyQuery>;
export type GetHotelSuspenseQueryHookResult = ReturnType<typeof useGetHotelSuspenseQuery>;
export type GetHotelQueryResult = Apollo.QueryResult<GetHotelQuery, GetHotelQueryVariables>;
export const CreateHotelDocument = gql`
    mutation CreateHotel($name: String!, $url: String!, $city: String!, $address: String, $starRating: Float, $userRating: Float, $reviewCount: Int, $description: String, $amenities: [String!], $images: [String!], $isCompetitor: Boolean) {
  createHotel(
    name: $name
    city: $city
    address: $address
    starRating: $starRating
    userRating: $userRating
    reviewCount: $reviewCount
    description: $description
    amenities: $amenities
    images: $images
    isCompetitor: $isCompetitor
    url: $url
  ) {
    id
    name
    city
    address
    starRating
    userRating
    reviewCount
    description
    amenities
    images
    isCompetitor
    url
    dailyPrices {
      id
      date
      price
      currency
      availability
      roomCategoryId
      scrapedAt
    }
    roomCategories {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;
export type CreateHotelMutationFn = Apollo.MutationFunction<CreateHotelMutation, CreateHotelMutationVariables>;

/**
 * __useCreateHotelMutation__
 *
 * To run a mutation, you first call `useCreateHotelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateHotelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createHotelMutation, { data, loading, error }] = useCreateHotelMutation({
 *   variables: {
 *      name: // value for 'name'
 *      url: // value for 'url'
 *      city: // value for 'city'
 *      address: // value for 'address'
 *      starRating: // value for 'starRating'
 *      userRating: // value for 'userRating'
 *      reviewCount: // value for 'reviewCount'
 *      description: // value for 'description'
 *      amenities: // value for 'amenities'
 *      images: // value for 'images'
 *      isCompetitor: // value for 'isCompetitor'
 *   },
 * });
 */
export function useCreateHotelMutation(baseOptions?: Apollo.MutationHookOptions<CreateHotelMutation, CreateHotelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateHotelMutation, CreateHotelMutationVariables>(CreateHotelDocument, options);
      }
export type CreateHotelMutationHookResult = ReturnType<typeof useCreateHotelMutation>;
export type CreateHotelMutationResult = Apollo.MutationResult<CreateHotelMutation>;
export type CreateHotelMutationOptions = Apollo.BaseMutationOptions<CreateHotelMutation, CreateHotelMutationVariables>;
export const UpdateHotelDocument = gql`
    mutation UpdateHotel($id: Int!, $name: String, $url: String, $city: String, $address: String, $starRating: Float, $userRating: Float, $reviewCount: Int, $description: String, $amenities: [String!], $images: [String!], $isCompetitor: Boolean) {
  updateHotel(
    id: $id
    name: $name
    url: $url
    city: $city
    address: $address
    starRating: $starRating
    userRating: $userRating
    reviewCount: $reviewCount
    description: $description
    amenities: $amenities
    images: $images
    isCompetitor: $isCompetitor
  ) {
    id
    name
    city
    address
    starRating
    userRating
    reviewCount
    description
    amenities
    images
    isCompetitor
    url
    dailyPrices {
      id
      date
      price
      currency
      availability
      roomCategoryId
      scrapedAt
    }
    roomCategories {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
    `;
export type UpdateHotelMutationFn = Apollo.MutationFunction<UpdateHotelMutation, UpdateHotelMutationVariables>;

/**
 * __useUpdateHotelMutation__
 *
 * To run a mutation, you first call `useUpdateHotelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateHotelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateHotelMutation, { data, loading, error }] = useUpdateHotelMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      url: // value for 'url'
 *      city: // value for 'city'
 *      address: // value for 'address'
 *      starRating: // value for 'starRating'
 *      userRating: // value for 'userRating'
 *      reviewCount: // value for 'reviewCount'
 *      description: // value for 'description'
 *      amenities: // value for 'amenities'
 *      images: // value for 'images'
 *      isCompetitor: // value for 'isCompetitor'
 *   },
 * });
 */
export function useUpdateHotelMutation(baseOptions?: Apollo.MutationHookOptions<UpdateHotelMutation, UpdateHotelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateHotelMutation, UpdateHotelMutationVariables>(UpdateHotelDocument, options);
      }
export type UpdateHotelMutationHookResult = ReturnType<typeof useUpdateHotelMutation>;
export type UpdateHotelMutationResult = Apollo.MutationResult<UpdateHotelMutation>;
export type UpdateHotelMutationOptions = Apollo.BaseMutationOptions<UpdateHotelMutation, UpdateHotelMutationVariables>;
export const DeleteHotelDocument = gql`
    mutation DeleteHotel($id: Int!) {
  deleteHotel(id: $id) {
    id
    name
  }
}
    `;
export type DeleteHotelMutationFn = Apollo.MutationFunction<DeleteHotelMutation, DeleteHotelMutationVariables>;

/**
 * __useDeleteHotelMutation__
 *
 * To run a mutation, you first call `useDeleteHotelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteHotelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteHotelMutation, { data, loading, error }] = useDeleteHotelMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteHotelMutation(baseOptions?: Apollo.MutationHookOptions<DeleteHotelMutation, DeleteHotelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteHotelMutation, DeleteHotelMutationVariables>(DeleteHotelDocument, options);
      }
export type DeleteHotelMutationHookResult = ReturnType<typeof useDeleteHotelMutation>;
export type DeleteHotelMutationResult = Apollo.MutationResult<DeleteHotelMutation>;
export type DeleteHotelMutationOptions = Apollo.BaseMutationOptions<DeleteHotelMutation, DeleteHotelMutationVariables>;
export const GetDashboardStatsDocument = gql`
    query GetDashboardStats {
  dashboardStats {
    title
    value
    icon
    color
    trend {
      value
      isPositive
    }
  }
}
    `;

/**
 * __useGetDashboardStatsQuery__
 *
 * To run a query within a React component, call `useGetDashboardStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDashboardStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDashboardStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDashboardStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>(GetDashboardStatsDocument, options);
      }
export function useGetDashboardStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>(GetDashboardStatsDocument, options);
        }
export function useGetDashboardStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>(GetDashboardStatsDocument, options);
        }
export type GetDashboardStatsQueryHookResult = ReturnType<typeof useGetDashboardStatsQuery>;
export type GetDashboardStatsLazyQueryHookResult = ReturnType<typeof useGetDashboardStatsLazyQuery>;
export type GetDashboardStatsSuspenseQueryHookResult = ReturnType<typeof useGetDashboardStatsSuspenseQuery>;
export type GetDashboardStatsQueryResult = Apollo.QueryResult<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>;
export const LatestPricesDocument = gql`
    query LatestPrices {
  hotels {
    id
    name
    isCompetitor
    latestPrice {
      price
      date
      scrapedAt
    }
    previousPrice {
      price
      date
      scrapedAt
    }
  }
}
    `;

/**
 * __useLatestPricesQuery__
 *
 * To run a query within a React component, call `useLatestPricesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestPricesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestPricesQuery({
 *   variables: {
 *   },
 * });
 */
export function useLatestPricesQuery(baseOptions?: Apollo.QueryHookOptions<LatestPricesQuery, LatestPricesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LatestPricesQuery, LatestPricesQueryVariables>(LatestPricesDocument, options);
      }
export function useLatestPricesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LatestPricesQuery, LatestPricesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LatestPricesQuery, LatestPricesQueryVariables>(LatestPricesDocument, options);
        }
export function useLatestPricesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LatestPricesQuery, LatestPricesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LatestPricesQuery, LatestPricesQueryVariables>(LatestPricesDocument, options);
        }
export type LatestPricesQueryHookResult = ReturnType<typeof useLatestPricesQuery>;
export type LatestPricesLazyQueryHookResult = ReturnType<typeof useLatestPricesLazyQuery>;
export type LatestPricesSuspenseQueryHookResult = ReturnType<typeof useLatestPricesSuspenseQuery>;
export type LatestPricesQueryResult = Apollo.QueryResult<LatestPricesQuery, LatestPricesQueryVariables>;
export const ScrapeAndStoreBatchDocument = gql`
    mutation ScrapeAndStoreBatch($hotelIds: [Int!]!) {
  scrapeAndStoreBatch(hotelIds: $hotelIds) {
    stored
    results {
      hotelId
      success
      error
    }
    message
  }
}
    `;
export type ScrapeAndStoreBatchMutationFn = Apollo.MutationFunction<ScrapeAndStoreBatchMutation, ScrapeAndStoreBatchMutationVariables>;

/**
 * __useScrapeAndStoreBatchMutation__
 *
 * To run a mutation, you first call `useScrapeAndStoreBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useScrapeAndStoreBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [scrapeAndStoreBatchMutation, { data, loading, error }] = useScrapeAndStoreBatchMutation({
 *   variables: {
 *      hotelIds: // value for 'hotelIds'
 *   },
 * });
 */
export function useScrapeAndStoreBatchMutation(baseOptions?: Apollo.MutationHookOptions<ScrapeAndStoreBatchMutation, ScrapeAndStoreBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ScrapeAndStoreBatchMutation, ScrapeAndStoreBatchMutationVariables>(ScrapeAndStoreBatchDocument, options);
      }
export type ScrapeAndStoreBatchMutationHookResult = ReturnType<typeof useScrapeAndStoreBatchMutation>;
export type ScrapeAndStoreBatchMutationResult = Apollo.MutationResult<ScrapeAndStoreBatchMutation>;
export type ScrapeAndStoreBatchMutationOptions = Apollo.BaseMutationOptions<ScrapeAndStoreBatchMutation, ScrapeAndStoreBatchMutationVariables>;
export const HotelsWithPricesByDateDocument = gql`
    query HotelsWithPricesByDate($date: String!) {
  hotelsWithPricesByDate(date: $date) {
    id
    name
    isCompetitor
    latestPriceAtDate(date: $date) {
      scrapedAt
      price
    }
    previousPriceAtDate(date: $date) {
      price
      scrapedAt
    }
  }
}
    `;

/**
 * __useHotelsWithPricesByDateQuery__
 *
 * To run a query within a React component, call `useHotelsWithPricesByDateQuery` and pass it any options that fit your needs.
 * When your component renders, `useHotelsWithPricesByDateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHotelsWithPricesByDateQuery({
 *   variables: {
 *      date: // value for 'date'
 *   },
 * });
 */
export function useHotelsWithPricesByDateQuery(baseOptions: Apollo.QueryHookOptions<HotelsWithPricesByDateQuery, HotelsWithPricesByDateQueryVariables> & ({ variables: HotelsWithPricesByDateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HotelsWithPricesByDateQuery, HotelsWithPricesByDateQueryVariables>(HotelsWithPricesByDateDocument, options);
      }
export function useHotelsWithPricesByDateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HotelsWithPricesByDateQuery, HotelsWithPricesByDateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HotelsWithPricesByDateQuery, HotelsWithPricesByDateQueryVariables>(HotelsWithPricesByDateDocument, options);
        }
export function useHotelsWithPricesByDateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HotelsWithPricesByDateQuery, HotelsWithPricesByDateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HotelsWithPricesByDateQuery, HotelsWithPricesByDateQueryVariables>(HotelsWithPricesByDateDocument, options);
        }
export type HotelsWithPricesByDateQueryHookResult = ReturnType<typeof useHotelsWithPricesByDateQuery>;
export type HotelsWithPricesByDateLazyQueryHookResult = ReturnType<typeof useHotelsWithPricesByDateLazyQuery>;
export type HotelsWithPricesByDateSuspenseQueryHookResult = ReturnType<typeof useHotelsWithPricesByDateSuspenseQuery>;
export type HotelsWithPricesByDateQueryResult = Apollo.QueryResult<HotelsWithPricesByDateQuery, HotelsWithPricesByDateQueryVariables>;