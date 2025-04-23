import { buildSchema } from 'graphql';

export const schema = buildSchema(`
    enum UserType {
        CORPORATE
        PROVIDER
        VISITOR
    }
    
    type User {
        id: ID!
        username: String!
        userType: UserType!
    }
    
    enum ParkingType {
        PUBLIC
        PRIVATE
        COURTESY
    }

    type Parking {
        id: ID!
        name: String!
        contact: String!
        spots: Int!
        parkingType: ParkingType!
        createdAt: String!
        updatedAt: String!
    }

    type CheckInResponse {
        success: Boolean!
        message: String
        errorCode: String
    }

    input ParkingInput {
        name: String!
        contact: String!
        spots: Int!
        parkingType: ParkingType!
    }

    input ParkingUpdateInput {
        contact: String
        spots: Int
    }

    type Query {
        parkings(skip: Int = 0, limit: Int = 10): [Parking!]!
    }

    type Mutation {
        createParking(input: ParkingInput!): Parking!
        updateParking(id: ID!, input: ParkingUpdateInput!): Parking!
        checkIn(parkingId: ID!, userType: UserType!): CheckInResponse!
    }
`);