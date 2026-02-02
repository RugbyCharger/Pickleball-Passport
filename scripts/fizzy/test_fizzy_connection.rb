#!/usr/bin/env ruby
# frozen_string_literal: true

# Test Fizzy API Connection
# Usage: ruby test_fizzy_connection.rb

require 'net/http'
require 'json'
require 'uri'

# Configuration - Update these values
BASE_URL = ENV['FIZZY_BASE_URL'] || 'https://fizzy.aikanga.com'
API_TOKEN = ENV['FIZZY_API_TOKEN'] || 'PLACEHOLDER'
ACCOUNT_SLUG = ENV['FIZZY_ACCOUNT_SLUG'] || '0000001'
BOARD_ID = ENV['FIZZY_BOARD_ID'] || 'MbPpjg9scA8KPJJuqHJENXUD'

def colorize(text, color)
  colors = {
    green: "\e[32m",
    red: "\e[31m",
    yellow: "\e[33m",
    blue: "\e[34m",
    reset: "\e[0m"
  }
  "#{colors[color]}#{text}#{colors[:reset]}"
end

def api_request(method, path, body = nil)
  uri = URI("#{BASE_URL}#{path}")

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'

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

  http.request(request)
end

def test_identity
  puts "\n#{colorize('Testing /my/identity...', :blue)}"
  response = api_request(:get, '/my/identity')

  if response.code == '200'
    data = JSON.parse(response.body)
    puts colorize("  ✓ Identity verified", :green)
    puts "    User: #{data['name']} (#{data['email_address']})"
    puts "    Role: #{data['role']}"
    puts "    Accounts: #{data['accounts']&.map { |a| a['name'] }&.join(', ')}"
    true
  else
    puts colorize("  ✗ Identity check failed: #{response.code}", :red)
    puts "    #{response.body}"
    false
  end
end

def test_boards
  puts "\n#{colorize('Testing boards access...', :blue)}"
  response = api_request(:get, "/#{ACCOUNT_SLUG}/boards")

  if response.code == '200'
    boards = JSON.parse(response.body)
    puts colorize("  ✓ Found #{boards.length} board(s)", :green)
    boards.each do |board|
      marker = board['id'] == BOARD_ID ? colorize(' ← TARGET', :yellow) : ''
      puts "    - #{board['name']} (#{board['id']})#{marker}"
    end
    true
  else
    puts colorize("  ✗ Boards check failed: #{response.code}", :red)
    puts "    #{response.body}"
    false
  end
end

def test_board_columns
  puts "\n#{colorize("Testing board columns for #{BOARD_ID}...", :blue)}"
  response = api_request(:get, "/#{ACCOUNT_SLUG}/boards/#{BOARD_ID}/columns")

  if response.code == '200'
    columns = JSON.parse(response.body)
    puts colorize("  ✓ Found #{columns.length} column(s)", :green)
    columns.each do |col|
      puts "    - #{col['name']} (#{col['id']})"
    end
    true
  else
    puts colorize("  ✗ Columns check failed: #{response.code}", :red)
    puts "    #{response.body}"
    false
  end
end

def test_tags
  puts "\n#{colorize('Testing tags access...', :blue)}"
  response = api_request(:get, "/#{ACCOUNT_SLUG}/tags")

  if response.code == '200'
    tags = JSON.parse(response.body)
    puts colorize("  ✓ Found #{tags.length} tag(s)", :green)
    tags.first(10).each { |tag| puts "    - ##{tag}" }
    puts "    ... and #{tags.length - 10} more" if tags.length > 10
    true
  else
    puts colorize("  ✗ Tags check failed: #{response.code}", :red)
    puts "    #{response.body}"
    false
  end
end

def test_users
  puts "\n#{colorize('Testing users access...', :blue)}"
  response = api_request(:get, "/#{ACCOUNT_SLUG}/users")

  if response.code == '200'
    users = JSON.parse(response.body)
    puts colorize("  ✓ Found #{users.length} user(s)", :green)
    users.each do |user|
      status = user['active'] ? colorize('active', :green) : colorize('inactive', :yellow)
      puts "    - #{user['name']} (#{user['role']}, #{status}) - ID: #{user['id']}"
    end
    true
  else
    puts colorize("  ✗ Users check failed: #{response.code}", :red)
    puts "    #{response.body}"
    false
  end
end

def run_tests
  puts colorize("\n═══════════════════════════════════════════════", :blue)
  puts colorize("       Fizzy API Connection Test", :blue)
  puts colorize("═══════════════════════════════════════════════", :blue)

  puts "\nConfiguration:"
  puts "  Base URL:      #{BASE_URL}"
  puts "  Account Slug:  #{ACCOUNT_SLUG}"
  puts "  Board ID:      #{BOARD_ID}"
  puts "  Token:         #{API_TOKEN[0..10]}...#{API_TOKEN[-4..-1]}" if API_TOKEN.length > 15

  results = []
  results << test_identity
  results << test_boards
  results << test_board_columns
  results << test_tags
  results << test_users

  puts "\n#{colorize('═══════════════════════════════════════════════', :blue)}"
  passed = results.count(true)
  total = results.length

  if passed == total
    puts colorize("  ALL TESTS PASSED (#{passed}/#{total})", :green)
    puts colorize("  Ready for bulk import!", :green)
  else
    puts colorize("  TESTS FAILED: #{passed}/#{total} passed", :red)
    puts "  Please check your credentials and try again."
  end
  puts colorize("═══════════════════════════════════════════════\n", :blue)
end

if API_TOKEN == 'PLACEHOLDER'
  puts colorize("\n⚠️  ERROR: API Token not set!", :red)
  puts "\nSet your token using one of these methods:"
  puts "  1. Edit this file and replace 'PLACEHOLDER'"
  puts "  2. Set environment variable: export FIZZY_API_TOKEN='your-token'"
  puts "  3. Run with: FIZZY_API_TOKEN='your-token' ruby #{__FILE__}"
  exit 1
end

run_tests
