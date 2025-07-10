import { gql } from '@apollo/client';

export const GET_HOTELS = gql`
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

export const GET_HOTEL = gql`
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

export const CREATE_HOTEL = gql`
  mutation CreateHotel(
    $name: String!, 
    $url: String!, 
    $city: String!, 
    $address: String, 
    $starRating: Float, 
    $userRating: Float, 
    $reviewCount: Int, 
    $description: String, 
    $amenities: [String!], 
    $images: [String!], 
    $isCompetitor: Boolean
  ) {
    createHotel(
      name: $name, 
      city: $city, 
      address: $address, 
      starRating: $starRating, 
      userRating: $userRating, 
      reviewCount: $reviewCount, 
      description: $description, 
      amenities: $amenities, 
      images: $images, 
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

export const UPDATE_HOTEL = gql`
  mutation UpdateHotel(
    $id: Int!, 
    $name: String, 
    $url: String, 
    $city: String, 
    $address: String, 
    $starRating: Float, 
    $userRating: Float, 
    $reviewCount: Int, 
    $description: String, 
    $amenities: [String!], 
    $images: [String!], 
    $isCompetitor: Boolean
    $url: String!
  ) {
    updateHotel(
      id: $id, 
      name: $name, 
      url: $url, 
      city: $city, 
      address: $address, 
      starRating: $starRating, 
      userRating: $userRating, 
      reviewCount: $reviewCount, 
      description: $description, 
      amenities: $amenities, 
      images: $images, 
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

export const DELETE_HOTEL = gql`
  mutation DeleteHotel($id: Int!) {
    deleteHotel(id: $id) {
      id
      name
    }
  }
`; 