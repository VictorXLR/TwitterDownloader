const express = require("express");
const router = express.Router();
const { TwitterApi } = require("twitter-api-v2");
const exceptionHandler = require("../ExceptionHandler");

// Helper function to implement retry logic with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            const delay = initialDelay * Math.pow(2, i);
            console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Initialize Twitter client with OAuth 1.0a credentials
const getTwitterClient = () => {
    return new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
};

// POST /tweet - Post a new tweet
const PostTweet = exceptionHandler.catchAsyncErrors(async (req, res, next) => {
    req.skip = true;
    req.pathx = "/tweet";

    if (!req.body.text) {
        return res.status(400).json({ error: "No text provided for tweet" });
    }

    const tweetText = req.body.text;

    if (tweetText.length > 280) {
        return res.status(400).json({ error: "Tweet text exceeds 280 characters" });
    }

    try {
        const client = getTwitterClient();

        // Post tweet with retry logic
        const tweet = await retryWithBackoff(async () => {
            return await client.v2.tweet(tweetText);
        });

        res.status(201).json({
            success: true,
            tweet: {
                id: tweet.data.id,
                text: tweet.data.text
            }
        });
    } catch (error) {
        console.error("Error posting tweet:", error);
        return res.status(500).json({
            error: "Failed to post tweet",
            details: error.message
        });
    }
});

// DELETE /tweet/all - Delete all tweets and retweets
const DeleteAllTweets = exceptionHandler.catchAsyncErrors(async (req, res, next) => {
    req.skip = true;
    req.pathx = "/tweet/all";

    try {
        const client = getTwitterClient();
        const rwClient = client.readWrite;

        // Get authenticated user
        const currentUser = await retryWithBackoff(async () => {
            return await client.v2.me();
        });

        const userId = currentUser.data.id;
        console.log(`Deleting all tweets for user: ${currentUser.data.username} (${userId})`);

        let deletedTweets = 0;
        let deletedRetweets = 0;
        let errors = 0;
        let paginationToken = null;

        // Fetch and delete all tweets in batches
        do {
            try {
                // Fetch user tweets with pagination
                const tweetsResponse = await retryWithBackoff(async () => {
                    return await client.v2.userTimeline(userId, {
                        max_results: 100,
                        pagination_token: paginationToken,
                        exclude: ['replies'] // We can optionally exclude replies
                    });
                }, 5, 2000);

                const tweets = tweetsResponse.data.data || [];
                paginationToken = tweetsResponse.data.meta?.next_token;

                if (tweets.length === 0) {
                    break;
                }

                console.log(`Processing batch of ${tweets.length} tweets...`);

                // Delete each tweet
                for (const tweet of tweets) {
                    try {
                        // Check if it's a retweet
                        const isRetweet = tweet.text.startsWith('RT @');

                        await retryWithBackoff(async () => {
                            await rwClient.v2.deleteTweet(tweet.id);
                        }, 5, 1000);

                        if (isRetweet) {
                            deletedRetweets++;
                        } else {
                            deletedTweets++;
                        }

                        console.log(`Deleted ${isRetweet ? 'retweet' : 'tweet'}: ${tweet.id}`);

                        // Small delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error(`Failed to delete tweet ${tweet.id}:`, error.message);
                        errors++;

                        // If we hit rate limit, wait longer
                        if (error.code === 429 || error.message.includes('rate limit')) {
                            console.log('Rate limit hit, waiting 60 seconds...');
                            await new Promise(resolve => setTimeout(resolve, 60000));
                        }
                    }
                }

                // Wait between batches to avoid rate limiting
                if (paginationToken) {
                    console.log('Waiting before next batch...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                console.error('Error fetching tweets:', error.message);

                // If we hit rate limit on fetching, wait and continue
                if (error.code === 429 || error.message.includes('rate limit')) {
                    console.log('Rate limit hit on fetch, waiting 60 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    continue;
                }

                break;
            }
        } while (paginationToken);

        res.status(200).json({
            success: true,
            summary: {
                deletedTweets,
                deletedRetweets,
                total: deletedTweets + deletedRetweets,
                errors
            }
        });
    } catch (error) {
        console.error("Error deleting tweets:", error);
        return res.status(500).json({
            error: "Failed to delete tweets",
            details: error.message
        });
    }
});

router.post("/", PostTweet);
router.delete("/all", DeleteAllTweets);

module.exports = router;
