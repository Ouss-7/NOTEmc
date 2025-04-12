const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;

// Initialize sentiment analyzer
const analyzer = new Analyzer("English", stemmer, "afinn");

/**
 * Generate a summary of text using TF-IDF algorithm
 * @param {string} text - The text to summarize
 * @param {number} sentenceCount - Number of sentences to include in summary
 * @returns {string} - The summarized text
 */
const generateSummary = (text, sentenceCount = 3) => {
  try {
    // Split text into sentences
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    
    if (sentences.length <= sentenceCount) {
      return text; // Return original if it's already short
    }
    
    // Create TF-IDF model
    const tfidf = new TfIdf();
    
    // Add each sentence to the model
    sentences.forEach(sentence => {
      tfidf.addDocument(sentence);
    });
    
    // Calculate sentence scores
    const sentenceScores = sentences.map((sentence, index) => {
      let score = 0;
      const words = tokenizer.tokenize(sentence);
      
      words.forEach(word => {
        // Get TF-IDF score for this word in this sentence
        tfidf.tfidfs(word, (i, measure) => {
          if (i === index) {
            score += measure;
          }
        });
      });
      
      return { sentence, score, index };
    });
    
    // Sort sentences by score and take top N
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, sentenceCount)
      .sort((a, b) => a.index - b.index) // Restore original order
      .map(item => item.sentence);
    
    return topSentences.join(' ');
  } catch (error) {
    console.error('Error generating summary:', error);
    return text.substring(0, 200) + '...'; // Fallback to simple truncation
  }
};

/**
 * Analyze sentiment of text
 * @param {string} text - The text to analyze
 * @returns {Object} - Sentiment analysis results
 */
const analyzeSentiment = (text) => {
  try {
    const tokens = tokenizer.tokenize(text);
    const sentiment = analyzer.getSentiment(tokens);
    
    // Map the sentiment score to a category
    let category = 'neutral';
    if (sentiment > 0.2) category = 'positive';
    if (sentiment < -0.2) category = 'negative';
    
    return {
      score: sentiment,
      category,
      analysis: {
        positive: sentiment > 0,
        negative: sentiment < 0,
        strength: Math.abs(sentiment),
      }
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { score: 0, category: 'neutral', error: error.message };
  }
};

module.exports = {
  generateSummary,
  analyzeSentiment
};
