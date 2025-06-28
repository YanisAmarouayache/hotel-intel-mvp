import { gql } from '@apollo/client';

export const GET_HOTELS = gql`
  query GetHotels {
    hotels {
      id
      name
      city
      price
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
      price
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_HOTEL = gql`
  mutation CreateHotel($name: String!, $city: String!, $price: Float!) {
    createHotel(name: $name, city: $city, price: $price) {
      id
      name
      city
      price
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_HOTEL = gql`
  mutation UpdateHotel($id: Int!, $name: String, $city: String, $price: Float) {
    updateHotel(id: $id, name: $name, city: $city, price: $price) {
      id
      name
      city
      price
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