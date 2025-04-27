import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';

/**
 * Generate a random name with a prefix
 * @param prefix The prefix to use for the random name
 * @returns A random name with the given prefix
 */
export function generateRandomName(prefix: string = 'Test'): string {
  const timestamp = new Date().getTime();
  const randomId = uuidv4().split('-')[0];
  return `${prefix}-${timestamp}-${randomId}`;
}

// Define response interfaces for type safety
interface ApiResponse {
  responses?: any[];
  surveys?: Array<{ id: string; name: string; [key: string]: any }>;
  [key: string]: any;
}

/**
 * API helper class for interacting with the Survey Builder API
 */
export class ApiHelper {
  private baseUrl: string;
  private apiKey: string | undefined;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = process.env.API_KEY;
  }

  /**
   * Get default headers for API requests
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Get survey responses via API
   * @param surveyId The ID of the survey
   * @returns Survey responses
   */
  async getSurveyResponses(surveyId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/${surveyId}/responses`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as ApiResponse;
      return data.responses || [];
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      return [];
    }
  }

  /**
   * Check if a specific response exists in the response list
   * @param surveyId The ID of the survey
   * @param optionValue The option value to look for in the responses
   * @returns True if the response exists, false otherwise
   */
  async responseExists(surveyId: string, optionValue: string): Promise<boolean> {
    const responses = await this.getSurveyResponses(surveyId);
    
    // This is a simplified example. In a real implementation, we would need to
    // match the exact structure of the response data from the API
    return responses.some(response => 
      response.answers && 
      response.answers.some((answer: any) => 
        answer.value === optionValue || 
        (Array.isArray(answer.value) && answer.value.includes(optionValue))
      )
    );
  }

  /**
   * Delete a survey via API
   * @param surveyId The ID of the survey to delete
   * @returns True if deletion was successful, false otherwise
   */
  async deleteSurvey(surveyId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys/${surveyId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting survey:', error);
      return false;
    }
  }

  /**
   * Get survey ID by name
   * @param surveyName The name of the survey
   * @returns The survey ID if found, null otherwise
   */
  async getSurveyIdByName(surveyName: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/surveys?name=${encodeURIComponent(surveyName)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as ApiResponse;
      const surveys = data.surveys || [];
      const survey = surveys.find((s) => s.name === surveyName);
      
      return survey ? survey.id : null;
    } catch (error) {
      console.error('Error getting survey ID:', error);
      return null;
    }
  }
}

// Export an instance of the API helper
export const apiHelper = new ApiHelper();