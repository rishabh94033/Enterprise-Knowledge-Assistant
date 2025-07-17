import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
// require("dotenv").config();
import dotenv from 'dotenv';
dotenv.config();

const confluencerouter = express.Router();

const fetchConfluencePage = async (title: string) => {
  const username = process.env.CONFLUENCE_USERNAME;
  const apiToken = process.env.API_TOKEN_CONFLUENCE;
  const domain = process.env.CONFLUENCE_DOMAIN;

  const response = await axios.get(
    `https://${domain}/wiki/rest/api/content`,
    {
      params: {
        title,
        expand: "body.storage"
      },
      auth: {
        username: username!,
        password: apiToken!
      }
    }
  );

  const page = response.data.results[0];
  if (!page) throw new Error(`Page not found: ${title}`);

  const htmlContent = page.body.storage.value;
  const dom = new JSDOM(htmlContent);
  const plainText = dom.window.document.body.textContent?.trim() ?? "";

  return plainText;
};

confluencerouter.get("/confluence-all-text", async (req, res) => {
  try {
    const titles = ["Company Leave Policy", "Expense Reimbursement Guidelines"];
    
    const texts = await Promise.all(titles.map(fetchConfluencePage));

    const combinedText = texts.join("\n\n---\n\n"); 
    return res.json({ combinedText });
  } catch (err) {
    console.error("Error fetching pages:", err);
    return res.status(500).json({ error: "Failed to fetch Confluence content" });
  }
});

export async function getallconfluence() {
  try {
    const titles = ["Company Leave Policy", "Expense Reimbursement Guidelines"];
    
    const texts = await Promise.all(titles.map(fetchConfluencePage));

    const combinedText = texts.join("\n\n---\n\n"); 
    return combinedText;
  } catch (err) {
    console.error("Error fetching pages:", err);
    throw new Error("Failed to fetch Confluence content");
  }
}

export default confluencerouter;

