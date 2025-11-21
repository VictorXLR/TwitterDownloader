#!/usr/bin/env node

/**
 * Script to delete all tweets and retweets for a Twitter account
 *
 * This script uses the Twitter API v2 to fetch and delete all tweets.
 * It implements retry logic and handles rate limiting efficiently.
 *
 * Usage: node src/deleteAllTweets.js
 */

require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");

// Retry logic with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 5, initialDelay = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            // Check if it's a rate limit error
            if (error.code === 429 || error.message.includes('rate limit')) {
                const delay = 60000; // Wait 60 seconds for rate limits
                console.log(`⏳ Rate limit hit. Waiting ${delay / 1000} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                const delay = initialDelay * Math.pow(2, i);
                console.log(`⚠️  Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
};

// Initialize Twitter client
const getTwitterClient = () => {
    const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    return client;
};

// Main deletion function
async function deleteAllTweets() {
    console.log("🚀 Starting Twitter deletion script...\n");

    try {
        const client = getTwitterClient();
        const rwClient = client.readWrite;

        // Verify credentials and get user info
        console.log("🔐 Verifying credentials...");
        const currentUser = await retryWithBackoff(async () => {
            return await client.v2.me();
        });

        const userId = currentUser.data.id;
        const username = currentUser.data.username;

        console.log(`✅ Authenticated as: @${username} (ID: ${userId})\n`);
        console.log("⚠️  WARNING: This will delete ALL tweets and retweets!");
        console.log("⚠️  This action cannot be undone!\n");

        // Stats tracking
        let deletedTweets = 0;
        let deletedRetweets = 0;
        let errors = 0;
        let totalProcessed = 0;

        // Process tweets in batches
        let paginationToken = null;
        let batchNumber = 0;

        do {
            batchNumber++;
            console.log(`📦 Processing batch #${batchNumber}...`);

            try {
                // Fetch user timeline with retry logic
                const tweetsResponse = await retryWithBackoff(async () => {
                    const params = {
                        max_results: 100,
                        'tweet.fields': ['created_at', 'referenced_tweets'],
                    };

                    if (paginationToken) {
                        params.pagination_token = paginationToken;
                    }

                    return await client.v2.userTimeline(userId, params);
                }, 5, 2000);

                const tweets = tweetsResponse.data.data || [];
                paginationToken = tweetsResponse.data.meta?.next_token;

                if (tweets.length === 0) {
                    console.log("\n✅ No more tweets to process!");
                    break;
                }

                console.log(`   Found ${tweets.length} tweets in this batch`);

                // Delete each tweet
                for (const tweet of tweets) {
                    totalProcessed++;

                    try {
                        // Determine if it's a retweet
                        const isRetweet = tweet.referenced_tweets?.some(ref => ref.type === 'retweeted');

                        // Delete with retry logic
                        await retryWithBackoff(async () => {
                            await rwClient.v2.deleteTweet(tweet.id);
                        }, 5, 1000);

                        if (isRetweet) {
                            deletedRetweets++;
                            console.log(`   ✅ Deleted retweet ${totalProcessed}: ${tweet.id}`);
                        } else {
                            deletedTweets++;
                            const preview = tweet.text.substring(0, 50).replace(/\n/g, ' ');
                            console.log(`   ✅ Deleted tweet ${totalProcessed}: "${preview}..."`);
                        }

                        // Small delay to avoid rate limiting (100ms between deletes)
                        await new Promise(resolve => setTimeout(resolve, 100));

                    } catch (error) {
                        errors++;
                        console.error(`   ❌ Failed to delete tweet ${tweet.id}: ${error.message}`);

                        // If we hit rate limit on delete, wait longer
                        if (error.code === 429 || error.message.includes('rate limit')) {
                            console.log('   ⏳ Rate limit hit on delete, waiting 60 seconds...');
                            await new Promise(resolve => setTimeout(resolve, 60000));
                        }
                    }
                }

                // Progress update
                console.log(`   📊 Progress: ${deletedTweets} tweets, ${deletedRetweets} retweets deleted (${errors} errors)\n`);

                // Wait between batches to avoid rate limiting (3 seconds)
                if (paginationToken) {
                    console.log('   ⏳ Waiting 3 seconds before next batch...\n');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                console.error(`\n❌ Error processing batch: ${error.message}`);

                // If we hit rate limit on fetch, wait and continue
                if (error.code === 429 || error.message.includes('rate limit')) {
                    console.log('⏳ Rate limit hit on fetch, waiting 60 seconds before retry...\n');
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    continue;
                }

                // For other errors, break the loop
                console.error('⚠️  Stopping due to error\n');
                break;
            }

        } while (paginationToken);

        // Final summary
        console.log("\n" + "=".repeat(50));
        console.log("📊 DELETION SUMMARY");
        console.log("=".repeat(50));
        console.log(`✅ Deleted Tweets: ${deletedTweets}`);
        console.log(`✅ Deleted Retweets: ${deletedRetweets}`);
        console.log(`📈 Total Deleted: ${deletedTweets + deletedRetweets}`);
        console.log(`❌ Errors: ${errors}`);
        console.log("=".repeat(50) + "\n");

        if (errors > 0) {
            console.log("⚠️  Some tweets could not be deleted. You may need to run this script again.");
        } else {
            console.log("🎉 All tweets and retweets have been successfully deleted!");
        }

    } catch (error) {
        console.error("\n❌ Fatal error:", error.message);
        console.error("\nPlease ensure your Twitter API credentials are correctly set in the .env file.");
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    deleteAllTweets()
        .then(() => {
            console.log("\n✅ Script completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Script failed:", error);
            process.exit(1);
        });
}

module.exports = { deleteAllTweets };
