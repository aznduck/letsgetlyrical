import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

// Set a timeout for tests to prevent hanging
jest.setTimeout(10000)
