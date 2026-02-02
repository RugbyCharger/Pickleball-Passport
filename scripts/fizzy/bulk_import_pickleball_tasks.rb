#!/usr/bin/env ruby
# frozen_string_literal: true

# Pickleball Passport - Fizzy Task Bulk Import
# Based on Jan 30, 2026 Strategy Meeting
#
# Usage:
#   FIZZY_API_TOKEN='your-token' ruby bulk_import_pickleball_tasks.rb
#
# Or set environment variables:
#   export FIZZY_BASE_URL='https://fizzy.aikanga.com'
#   export FIZZY_API_TOKEN='your-personal-access-token'
#   export FIZZY_ACCOUNT_SLUG='0000001'
#   export FIZZY_BOARD_ID='MbPpjg9scA8KPJJuqHJENXUD'

require 'net/http'
require 'json'
require 'uri'

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

BASE_URL = ENV['FIZZY_BASE_URL'] || 'https://fizzy.aikanga.com'
API_TOKEN = ENV['FIZZY_API_TOKEN'] || 'PLACEHOLDER'
ACCOUNT_SLUG = ENV['FIZZY_ACCOUNT_SLUG'] || '0000001'
BOARD_ID = ENV['FIZZY_BOARD_ID'] || 'MbPpjg9scA8KPJJuqHJENXUD'

# ═══════════════════════════════════════════════════════════════════════════════
# TASK DEFINITIONS - From Jan 30, 2026 Strategy Meeting
# ═══════════════════════════════════════════════════════════════════════════════

TASKS = {
  'Jaron' => [
    {
      title: '🔴 VALIDATION SPRINT - Call 10 warm network contacts',
      description: <<~DESC,
        <strong>Due: Feb 7, 2026 | Priority: URGENT</strong>

        Call friends/family who play pickleball. Document EXACT responses using Granola.

        <strong>Track:</strong>
        <ul>
          <li>Objections raised</li>
          <li>Pricing feedback</li>
          <li>Booking interest level</li>
        </ul>

        <strong>Script to use:</strong>
        <em>"I invested in Suk Space Bangkok. We're doing 12-14 day trips at $3,500-$4,500. Would you pay that? Be honest - I need real feedback."</em>

        <strong>Success criteria:</strong> 10 calls completed with documented responses
      DESC
      tags: %w[urgent week-1 jaron validation],
      due: '2026-02-07'
    },
    {
      title: '🔴 VALIDATION SPRINT - Call 10 cold/referral contacts',
      description: <<~DESC,
        <strong>Due: Feb 9, 2026 | Priority: URGENT</strong>

        Call pickleball community contacts (NOT close friends). Document responses.

        <strong>Focus on:</strong>
        <ul>
          <li>Reactions from people outside your warm network</li>
          <li>Objections and concerns</li>
          <li>Pricing feedback - is $3,500-$4,500 reasonable?</li>
          <li>Would they actually book?</li>
        </ul>

        <strong>Success criteria:</strong> 10 calls completed with documented responses
      DESC
      tags: %w[urgent week-1 jaron validation],
      due: '2026-02-09'
    },
    {
      title: '🔴 CONTENT CAPTURE - Hua Hin Tournament',
      description: <<~DESC,
        <strong>Due: Feb 9, 2026 | Priority: URGENT</strong>

        Record tournament footage for marketing content.

        <strong>Content to capture:</strong>
        <ul>
          <li>Courts and facility shots</li>
          <li>Action gameplay footage</li>
          <li>Selfie videos with venue in background</li>
          <li>Photos with facility/sponsors/players</li>
        </ul>

        <strong>Workflow:</strong>
        <ol>
          <li>Film everything - we can edit later</li>
          <li>Share to WhatsApp/team immediately</li>
          <li>Ina will handle editing</li>
        </ol>
      DESC
      tags: %w[urgent week-1 jaron content],
      due: '2026-02-09'
    },
    {
      title: '🟡 Create personal story video for Instagram',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Create pinned Instagram post video.

        <strong>Content:</strong>
        <ul>
          <li>Who you are</li>
          <li>Why Thailand</li>
          <li>Your pickleball journey</li>
          <li>Connection to Suk Space Bangkok</li>
        </ul>

        <strong>Purpose:</strong> Builds authority and trust with potential customers.

        This becomes your pinned post - first thing people see on your profile.
      DESC
      tags: %w[high-priority week-2 jaron content],
      due: '2026-02-16'
    },
    {
      title: '🟡 Update LinkedIn: Add "Co-Founder, Suk Space Bangkok"',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Update LinkedIn profile to show Suk Space co-founder/part owner status.

        <strong>Why this matters:</strong>
        This is CRITICAL for authority positioning. When people research you, they need to see:
        <ul>
          <li>You're not just a random tour operator</li>
          <li>You have skin in the game with the venue</li>
          <li>You're a co-founder, not a middleman</li>
        </ul>
      DESC
      tags: %w[high-priority week-2 jaron linkedin],
      due: '2026-02-16'
    },
    {
      title: '🟡 Facebook blast to warm network',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Post about beta trip opportunity to warm network on Facebook.

        <strong>Action items:</strong>
        <ul>
          <li>Craft compelling post about May 2026 trip</li>
          <li>Ask family members to repost</li>
          <li>Engage with comments and DMs</li>
        </ul>

        <strong>Goal:</strong> Expand reach beyond direct connections through family reshares.
      DESC
      tags: %w[high-priority week-2 jaron social],
      due: '2026-02-16'
    },
    {
      title: '🟡 SALES PREP - Cole Gordon script refinement',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Work with Grant on sales script refinement.

        <strong>Tasks:</strong>
        <ul>
          <li>Review and refine Cole Gordon-style sales script</li>
          <li>Practice pitch until it's muscle memory</li>
          <li>Set up calendar for sales calls</li>
          <li>Role-play scenarios with team</li>
        </ul>

        <strong>Goal:</strong> Be ready to close when validation calls show interest.
      DESC
      tags: %w[high-priority week-2 jaron sales],
      due: '2026-02-16'
    },
    {
      title: '🟢 ONGOING: Daily content creation',
      description: <<~DESC,
        <strong>Priority: ONGOING</strong>

        Document daily life for content library.

        <strong>Daily activities to film:</strong>
        <ul>
          <li>Lacing shoes</li>
          <li>Changing grips</li>
          <li>Training sessions</li>
          <li>Playing matches</li>
          <li>Suk Space venue shots</li>
          <li>Tournament participation</li>
          <li>Expat lifestyle moments</li>
        </ul>

        <strong>Workflow:</strong>
        <ol>
          <li>Film at every opportunity</li>
          <li>Share raw footage to team</li>
          <li>Ina handles editing and polishing</li>
        </ol>

        <strong>Goal:</strong> Build massive content library for marketing use.
      DESC
      tags: %w[ongoing jaron content],
      due: nil
    }
  ],

  'Ryan' => [
    {
      title: '🔴 COMPETITOR RESEARCH - Research 10 competitors',
      description: <<~DESC,
        <strong>Due: Feb 7, 2026 | Priority: URGENT</strong>

        Research pickleball tour competitors.

        <strong>Companies to research:</strong>
        <ul>
          <li>Pickleball Trips</li>
          <li>Golden Triangle Pickleball</li>
          <li>8 other competitors (find them)</li>
        </ul>

        <strong>Create one-pager with:</strong>
        <ul>
          <li>Pricing & durations</li>
          <li>What's included</li>
          <li>Trip destinations</li>
          <li>Unique selling points</li>
          <li>How they position themselves</li>
        </ul>

        <strong>Deliverable:</strong> Competitive analysis one-pager for team review.
      DESC
      tags: %w[urgent week-1 ryan research],
      due: '2026-02-07'
    },
    {
      title: '🔴 Read 50+ customer reviews',
      description: <<~DESC,
        <strong>Due: Feb 7, 2026 | Priority: URGENT</strong>

        Read customer reviews across platforms.

        <strong>Platforms to check:</strong>
        <ul>
          <li>TripAdvisor</li>
          <li>Google Reviews</li>
          <li>Yelp</li>
          <li>Expedia</li>
          <li>Booking.com</li>
        </ul>

        <strong>Document:</strong>
        <ul>
          <li>Words customers use to describe experience</li>
          <li>What made it worth the price</li>
          <li>Common complaints</li>
          <li>Whether hosts are mentioned by name</li>
        </ul>

        <strong>Why:</strong> Understand what customers actually value vs. what we think they want.
      DESC
      tags: %w[urgent week-1 ryan research],
      due: '2026-02-07'
    },
    {
      title: '🔴 Analyze general Thailand tour operators',
      description: <<~DESC,
        <strong>Due: Feb 7, 2026 | Priority: URGENT</strong>

        Research general (non-pickleball) Thailand tour operators.

        <strong>Focus on:</strong>
        <ul>
          <li>Premium 12-14 day tours</li>
          <li>Pricing structures</li>
          <li>What's included at different price points</li>
          <li>Market rates for Thailand premium experiences</li>
        </ul>

        <strong>Purpose:</strong> Understand broader market to validate our $3,500-$4,500 pricing.
      DESC
      tags: %w[urgent week-1 ryan research],
      due: '2026-02-07'
    },
    {
      title: '🟡 PAYMENT INFRASTRUCTURE - Set up Stripe',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Set up Stripe account for US LLC (Polly & Son).

        <strong>Tasks:</strong>
        <ul>
          <li>Set up Stripe account under Polly & Son LLC</li>
          <li>Test payment processing</li>
          <li>Document process for future Dubai setup</li>
          <li>Confirm EIN/business banking access</li>
        </ul>

        <strong>Note:</strong> Grant available for technical support if needed.
      DESC
      tags: %w[high-priority week-2 ryan payments],
      due: '2026-02-16'
    },
    {
      title: '🟡 Create business WhatsApp account',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Set up WhatsApp Business for team communication with customers.

        <strong>Setup:</strong>
        <ul>
          <li>Use Jaron's Thai number</li>
          <li>Configure admin access for Grant</li>
          <li>Document WhatsApp business protocols</li>
        </ul>

        <strong>Purpose:</strong> Professional communication channel for prospects and customers.
      DESC
      tags: %w[high-priority week-2 ryan communications],
      due: '2026-02-16'
    },
    {
      title: '🟡 LOGISTICS - Connect with Greg',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Connect with Greg (travel agent contact from Lec).

        <strong>Agenda:</strong>
        <ul>
          <li>Get concrete pricing from Thai travel coordinator</li>
          <li>Coordinate availability for May timeline</li>
          <li>Document accommodation options</li>
          <li>Document flight packages</li>
        </ul>

        <strong>Goal:</strong> Lock in logistics pricing for May 2026 beta trip.
      DESC
      tags: %w[high-priority week-2 ryan logistics],
      due: '2026-02-16'
    },
    {
      title: '🟢 ONGOING: Build pickleball director list',
      description: <<~DESC,
        <strong>Priority: ONGOING</strong>

        Build email list for future cold outreach.

        <strong>Tool:</strong> Instantly's super search (150+ filters)

        <strong>Target personas:</strong>
        <ul>
          <li>Pickleball directors</li>
          <li>Coaches</li>
          <li>Club owners</li>
        </ul>

        <strong>Focus cities:</strong>
        <ul>
          <li>Seattle (high Asian-American population)</li>
          <li>San Francisco (high Asian-American population)</li>
          <li>Hawaii (high Asian-American population)</li>
        </ul>

        <strong>Note:</strong> This is for AFTER validation sprint. Do not send cold emails until we validate the offer with warm network.
      DESC
      tags: %w[ongoing ryan list-building],
      due: nil
    }
  ],

  'Grant' => [
    {
      title: '🔴 Process Granola transcript',
      description: <<~DESC,
        <strong>Due: Feb 7, 2026 | Priority: URGENT</strong>

        Process the Jan 30, 2026 strategy meeting transcript from Granola.

        <strong>Tasks:</strong>
        <ul>
          <li>Export transcript from Granola</li>
          <li>Clean up and organize content</li>
          <li>Identify key discussion threads</li>
          <li>Extract action items</li>
        </ul>

        <strong>Deliverable:</strong> Clean transcript ready for summary creation.
      DESC
      tags: %w[urgent week-1 grant documentation],
      due: '2026-02-07'
    },
    {
      title: '🔴 Create summary Google Doc',
      description: <<~DESC,
        <strong>Due: Feb 7, 2026 | Priority: URGENT</strong>

        Create comprehensive summary document.

        <strong>Include:</strong>
        <ul>
          <li>Key decisions made</li>
          <li>Bullet points of main discussion topics</li>
          <li>Action items by person</li>
          <li>Next steps and timelines</li>
          <li>Anything missed in discussion</li>
        </ul>

        <strong>Deliverable:</strong> Shareable Google Doc for team reference.
      DESC
      tags: %w[urgent week-1 grant documentation],
      due: '2026-02-07'
    },
    {
      title: '🔴 Set up Fizzy.do Kanban board',
      description: <<~DESC,
        <strong>Due: Feb 7, 2026 | Priority: URGENT</strong>

        Populate Fizzy board with all tasks from strategy session.

        <strong>Tasks:</strong>
        <ul>
          <li>Import all tasks with descriptions</li>
          <li>Assign to team members</li>
          <li>Set deadlines based on validation sprint timeline</li>
          <li>Create appropriate tags</li>
        </ul>

        <strong>Columns:</strong>
        <ul>
          <li>To Do</li>
          <li>In Progress</li>
          <li>Done</li>
          <li>Blocked</li>
        </ul>
      DESC
      tags: %w[urgent week-1 grant setup],
      due: '2026-02-07'
    },
    {
      title: '🟡 Create Jaron AI avatar/clone',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Create AI avatar/clone of Jaron for automated responses.

        <strong>Research:</strong>
        <ul>
          <li>Mopa and similar email automation tools</li>
          <li>AI voice/video cloning options</li>
          <li>Automated response systems</li>
        </ul>

        <strong>Goal:</strong> Scale Jaron's presence without requiring his time for every interaction.
      DESC
      tags: %w[high-priority week-2 grant automation],
      due: '2026-02-16'
    },
    {
      title: '🟡 Support Ryan with Stripe setup',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Provide technical guidance for Stripe configuration.

        <strong>Support areas:</strong>
        <ul>
          <li>Account configuration</li>
          <li>Testing payment flows</li>
          <li>Integration planning</li>
          <li>Security best practices</li>
        </ul>

        <strong>Available on-demand as Ryan works through setup.</strong>
      DESC
      tags: %w[high-priority week-2 grant support],
      due: '2026-02-16'
    },
    {
      title: '🟡 Create LinkedIn posts from Suk Space content',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH</strong>

        Create LinkedIn content from Jaron's footage.

        <strong>Content sources:</strong>
        <ul>
          <li>Photos/videos Jaron sends</li>
          <li>Official venue photos</li>
          <li>Jaron's personal content</li>
        </ul>

        <strong>Copy focus:</strong>
        <ul>
          <li>Highlight co-founder status</li>
          <li>Build authority positioning</li>
          <li>Showcase the facility</li>
        </ul>
      DESC
      tags: %w[high-priority week-2 grant content],
      due: '2026-02-16'
    },
    {
      title: '🟢 ONGOING: Strategy & advisory support',
      description: <<~DESC,
        <strong>Priority: ONGOING</strong>

        Provide strategic guidance and "tough love" as needed.

        <strong>Role:</strong>
        <ul>
          <li>"Tough love uncle/sheriff" guidance</li>
          <li>Available for Ryan operational support</li>
          <li>Review validation sprint results</li>
          <li>Analyze data when calls complete</li>
          <li>Prepare decision framework for Week 2 pivot/proceed choice</li>
        </ul>

        <strong>Approach:</strong> Data over opinions. Let customer feedback guide decisions.
      DESC
      tags: %w[ongoing grant strategy],
      due: nil
    },
    {
      title: '🟢 ONGOING: Monitor Fizzy board progress',
      description: <<~DESC,
        <strong>Priority: ONGOING</strong>

        Facilitate team coordination and progress tracking.

        <strong>Tasks:</strong>
        <ul>
          <li>Schedule follow-up meetings after validation sprint (Week 2)</li>
          <li>Coordinate Jaron/Ryan check-ins</li>
          <li>Monitor progress on Fizzy board</li>
          <li>Flag blockers early</li>
        </ul>
      DESC
      tags: %w[ongoing grant facilitation],
      due: nil
    }
  ],

  'Team' => [
    {
      title: '⚪ WEEK 1: Pause non-essential activities',
      description: <<~DESC,
        <strong>Due: Feb 9, 2026 | Priority: CRITICAL</strong>

        <strong>ALL team members:</strong> Pause non-essential activities for 7 days.

        <strong>Why:</strong>
        This validation sprint is critical for gathering real market data. We need focused effort, not scattered attention.

        <strong>The rule:</strong>
        If it's not directly related to validation calls, competitor research, or content capture - it can wait.

        <strong>After Day 7:</strong> Review results and decide on next steps.
      DESC
      tags: %w[team week-1 all critical],
      due: '2026-02-09'
    },
    {
      title: '⚪ DAY 7 DECISION POINT: Review validation results',
      description: <<~DESC,
        <strong>Due: Feb 9, 2026 | Priority: CRITICAL - DECISION GATE</strong>

        Team decision gate based on validation results.

        <strong>Decision framework:</strong>
        <ul>
          <li><strong>5+ say "I'd book this"</strong> → PROCEED to sales mode</li>
          <li><strong>2-4 interested</strong> → ADJUST offer based on feedback</li>
          <li><strong>0-1 interested</strong> → STOP and fix offer first</li>
        </ul>

        <strong>Data to review:</strong>
        <ul>
          <li>Jaron's 20 call summaries</li>
          <li>Objections documented</li>
          <li>Pricing feedback</li>
          <li>Interest levels</li>
        </ul>

        <strong>This is a GO/NO-GO gate. Data drives the decision.</strong>
      DESC
      tags: %w[team decision-gate critical week-1],
      due: '2026-02-09'
    },
    {
      title: '⚪ WEEK 2: Team meeting - Review validation & GO/NO-GO',
      description: <<~DESC,
        <strong>Due: Feb 16, 2026 | Priority: HIGH - DECISION GATE</strong>

        Week 2 team sync to review all validation data.

        <strong>Agenda:</strong>
        <ol>
          <li>Ryan presents competitor research findings</li>
          <li>Jaron shares documented call responses</li>
          <li>Make GO/NO-GO decision on May launch</li>
          <li>Refine pricing based on competitor + customer feedback</li>
          <li>CRM selection discussion</li>
        </ol>

        <strong>Outcome:</strong> Clear decision on whether to proceed with May 2026 beta trip.
      DESC
      tags: %w[team week-2 decision-gate],
      due: '2026-02-16'
    },
    {
      title: '🟢 ONGOING: Weekly team check-ins',
      description: <<~DESC,
        <strong>Priority: ONGOING</strong>

        Maintain regular team communication.

        <strong>Principles:</strong>
        <ul>
          <li>Open, transparent communication</li>
          <li>Data-driven decisions</li>
          <li>Focus over scattered activity</li>
          <li>Maintain alignment on 2026 strategy</li>
        </ul>

        <strong>Format:</strong>
        <ul>
          <li>Quick sync calls as needed</li>
          <li>Fizzy board updates</li>
          <li>WhatsApp for async</li>
        </ul>
      DESC
      tags: %w[team ongoing communication],
      due: nil
    }
  ]
}

# ═══════════════════════════════════════════════════════════════════════════════
# HELPER METHODS
# ═══════════════════════════════════════════════════════════════════════════════

def colorize(text, color)
  colors = {
    green: "\e[32m",
    red: "\e[31m",
    yellow: "\e[33m",
    blue: "\e[34m",
    cyan: "\e[36m",
    magenta: "\e[35m",
    bold: "\e[1m",
    reset: "\e[0m"
  }
  "#{colors[color]}#{text}#{colors[:reset]}"
end

def api_request(method, path, body = nil, max_retries = 3)
  uri = URI("#{BASE_URL}#{path}")

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'
  http.read_timeout = 30
  http.open_timeout = 10

  request = case method
            when :get then Net::HTTP::Get.new(uri)
            when :post then Net::HTTP::Post.new(uri)
            when :put then Net::HTTP::Put.new(uri)
            when :delete then Net::HTTP::Delete.new(uri)
            end

  request['Authorization'] = "Bearer #{API_TOKEN}"
  request['Content-Type'] = 'application/json'
  request['Accept'] = 'application/json'
  request.body = body.to_json if body

  attempt = 0
  begin
    attempt += 1
    http.request(request)
  rescue Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET => e
    if attempt < max_retries
      sleep(2 ** attempt) # Exponential backoff
      retry
    else
      raise e
    end
  end
end

def create_card(title, description, tags = [])
  path = "/#{ACCOUNT_SLUG}/boards/#{BOARD_ID}/cards"

  body = {
    card: {
      title: title,
      description: description,
      status: 'published'
    }
  }

  response = api_request(:post, path, body)

  if response.code == '201'
    # Get card number from Location header
    location = response['Location']
    card_number = location&.split('/')&.last&.to_i
    { success: true, card_number: card_number }
  else
    { success: false, error: "#{response.code}: #{response.body}" }
  end
end

def add_tag_to_card(card_number, tag)
  path = "/#{ACCOUNT_SLUG}/cards/#{card_number}/taggings"
  body = { tag_title: tag }

  response = api_request(:post, path, body)
  response.code == '204'
end

def get_columns
  path = "/#{ACCOUNT_SLUG}/boards/#{BOARD_ID}/columns"
  response = api_request(:get, path)

  if response.code == '200'
    JSON.parse(response.body)
  else
    []
  end
end

def create_column(name, color = 'var(--color-card-default)')
  path = "/#{ACCOUNT_SLUG}/boards/#{BOARD_ID}/columns"
  body = {
    column: {
      name: name,
      color: color
    }
  }

  response = api_request(:post, path, body)
  response.code == '201'
end

def move_card_to_column(card_number, column_id)
  path = "/#{ACCOUNT_SLUG}/cards/#{card_number}/triage"
  body = { column_id: column_id }

  response = api_request(:post, path, body)
  response.code == '204'
end

def get_users
  path = "/#{ACCOUNT_SLUG}/users"
  response = api_request(:get, path)

  if response.code == '200'
    JSON.parse(response.body)
  else
    []
  end
end

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN IMPORT LOGIC
# ═══════════════════════════════════════════════════════════════════════════════

def run_import
  puts colorize("\n╔══════════════════════════════════════════════════════════════════╗", :blue)
  puts colorize("║     PICKLEBALL PASSPORT - FIZZY TASK BULK IMPORT                 ║", :blue)
  puts colorize("║     Based on Jan 30, 2026 Strategy Meeting                       ║", :blue)
  puts colorize("╚══════════════════════════════════════════════════════════════════╝\n", :blue)

  # Verify configuration
  if API_TOKEN == 'PLACEHOLDER'
    puts colorize("❌ ERROR: API Token not set!", :red)
    puts "\nSet your token: FIZZY_API_TOKEN='your-token' ruby #{__FILE__}"
    exit 1
  end

  puts "Configuration:"
  puts "  Base URL:      #{BASE_URL}"
  puts "  Account Slug:  #{ACCOUNT_SLUG}"
  puts "  Board ID:      #{BOARD_ID}"
  puts ""

  # Test connection
  print "Testing connection... "
  response = api_request(:get, '/my/identity')
  if response.code == '200'
    user = JSON.parse(response.body)
    puts colorize("✓ Connected as #{user['name']}", :green)
  else
    puts colorize("✗ Connection failed: #{response.code}", :red)
    exit 1
  end

  # Ensure columns exist
  puts "\nChecking columns..."
  columns = get_columns
  column_names = columns.map { |c| c['name'] }
  puts "  Found: #{column_names.join(', ')}"

  # Get "To Do" column ID for placing new cards
  todo_column = columns.find { |c| c['name'].downcase.include?('to do') || c['name'].downcase == 'todo' }
  todo_column_id = todo_column&.dig('id')

  if todo_column_id
    puts colorize("  ✓ Will place cards in '#{todo_column['name']}' column", :green)
  else
    puts colorize("  ⚠ No 'To Do' column found - cards will be in triage", :yellow)
  end

  # Import statistics
  stats = {
    total: 0,
    created: 0,
    failed: 0,
    by_assignee: Hash.new(0),
    by_priority: Hash.new(0),
    tags_added: 0
  }

  # Process each assignee's tasks
  TASKS.each do |assignee, tasks|
    puts colorize("\n┌─────────────────────────────────────────", :cyan)
    puts colorize("│ #{assignee.upcase}'S TASKS (#{tasks.length})", :cyan)
    puts colorize("└─────────────────────────────────────────", :cyan)

    tasks.each_with_index do |task, idx|
      stats[:total] += 1

      print "  [#{idx + 1}/#{tasks.length}] Creating: #{task[:title][0..50]}... "

      result = create_card(task[:title], task[:description], task[:tags])

      if result[:success]
        card_number = result[:card_number]
        stats[:created] += 1
        stats[:by_assignee][assignee] += 1

        # Determine priority
        if task[:tags]&.include?('urgent')
          stats[:by_priority]['urgent'] += 1
        elsif task[:tags]&.include?('high-priority')
          stats[:by_priority]['high-priority'] += 1
        elsif task[:tags]&.include?('ongoing')
          stats[:by_priority]['ongoing'] += 1
        else
          stats[:by_priority]['normal'] += 1
        end

        puts colorize("✓ Card ##{card_number}", :green)

        # Add tags
        if task[:tags]&.any?
          task[:tags].each do |tag|
            if add_tag_to_card(card_number, tag)
              stats[:tags_added] += 1
            end
          end
          puts "       Tags: #{task[:tags].map { |t| "##{t}" }.join(' ')}"
        end

        # Move to To Do column if available
        if todo_column_id
          move_card_to_column(card_number, todo_column_id)
        end

        # Rate limiting - be nice to the API
        sleep(0.5)
      else
        stats[:failed] += 1
        puts colorize("✗ Failed: #{result[:error]}", :red)
      end
    end
  end

  # Print summary
  puts colorize("\n╔══════════════════════════════════════════════════════════════════╗", :blue)
  puts colorize("║                        IMPORT SUMMARY                            ║", :blue)
  puts colorize("╚══════════════════════════════════════════════════════════════════╝", :blue)

  puts "\n#{colorize('Overall:', :bold)}"
  puts "  Total tasks:    #{stats[:total]}"
  puts "  Created:        #{colorize(stats[:created].to_s, :green)}"
  puts "  Failed:         #{stats[:failed] > 0 ? colorize(stats[:failed].to_s, :red) : stats[:failed]}"
  puts "  Tags added:     #{stats[:tags_added]}"

  puts "\n#{colorize('By Assignee:', :bold)}"
  stats[:by_assignee].each do |assignee, count|
    puts "  #{assignee}: #{count} tasks"
  end

  puts "\n#{colorize('By Priority:', :bold)}"
  stats[:by_priority].each do |priority, count|
    emoji = case priority
            when 'urgent' then '🔴'
            when 'high-priority' then '🟡'
            when 'ongoing' then '🟢'
            else '⚪'
            end
    puts "  #{emoji} #{priority}: #{count}"
  end

  puts "\n#{colorize('Board URL:', :bold)}"
  puts "  #{BASE_URL}/#{ACCOUNT_SLUG}/boards/#{BOARD_ID}"

  if stats[:failed] == 0
    puts colorize("\n✅ All tasks imported successfully!", :green)
  else
    puts colorize("\n⚠️  Some tasks failed to import. Check errors above.", :yellow)
  end
end

# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

if __FILE__ == $PROGRAM_NAME
  run_import
end
