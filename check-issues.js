const { LinearClient } = require('@linear/sdk');
require('dotenv').config();

async function checkRecentIssues() {
  const client = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY
  });

  try {
    console.log('\n🔍 Checking Linear issues...\n');
    console.log('Team ID:', process.env.LINEAR_TEAM_ID);
    console.log('---\n');

    // Get team info
    const team = await client.team(process.env.LINEAR_TEAM_ID);
    console.log(`✅ Team Name: ${team.name}`);
    console.log(`✅ Team Key: ${team.key}\n`);

    // Get recent issues for this team
    const issues = await client.issues({
      filter: {
        team: { id: { eq: process.env.LINEAR_TEAM_ID } }
      },
      orderBy: 'createdAt',
      first: 20  // Get last 20 issues
    });

    console.log(`📋 Found ${issues.nodes.length} recent issues:\n`);

    for (const issue of issues.nodes) {
      const createdDate = new Date(issue.createdAt);
      const isRecent = (Date.now() - createdDate.getTime()) < 3600000; // Last hour
      const marker = isRecent ? '🆕' : '  ';

      console.log(`${marker} ${issue.identifier}: ${issue.title}`);
      console.log(`   State: ${issue.state?.name || 'Unknown'}`);
      console.log(`   Created: ${createdDate.toLocaleString()}`);
      console.log(`   URL: ${issue.url}`);
      console.log('');
    }

    // Search for specific ITC issues
    console.log('\n🔎 Searching for ITC-113 to ITC-119...\n');

    for (let i = 113; i <= 119; i++) {
      const identifier = `ITC-${i}`;
      try {
        const searchResults = await client.issues({
          filter: {
            identifier: { eq: identifier }
          }
        });

        if (searchResults.nodes.length > 0) {
          const issue = searchResults.nodes[0];
          console.log(`✅ ${identifier}: ${issue.title} (${issue.state?.name})`);
          console.log(`   URL: ${issue.url}`);
        } else {
          console.log(`❌ ${identifier}: Not found`);
        }
      } catch (err) {
        console.log(`⚠️  ${identifier}: Error - ${err.message}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

checkRecentIssues();
