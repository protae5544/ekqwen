#!/bin/bash

# Project Change Detection Script
# This script monitors the project for changes and provides reports

PROJECT_DIR="/storage/emulated/0/000update"
LOG_FILE="$PROJECT_DIR/change-log.txt"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "=== Change Detection Report - $TIMESTAMP ===" >> "$LOG_FILE"

# Function to check file modifications
check_file_changes() {
    local file_pattern=$1
    local description=$2
    
    echo "Checking $description..." >> "$LOG_FILE"
    
    # Find files modified in the last 10 minutes
    find "$PROJECT_DIR" -name "$file_pattern" -mmin -10 -type f 2>/dev/null | while read file; do
        local mod_time=$(stat -c %y "$file" 2>/dev/null)
        local size=$(stat -c %s "$file" 2>/dev/null)
        echo "  MODIFIED: $file (Size: $size bytes, Modified: $mod_time)" >> "$LOG_FILE"
    done
    
    # Count total files
    local total_files=$(find "$PROJECT_DIR" -name "$file_pattern" -type f 2>/dev/null | wc -l)
    echo "  Total $description files: $total_files" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Function to check project structure
check_project_structure() {
    echo "Project Structure Overview:" >> "$LOG_FILE"
    
    # List main directories
    echo "Directories:" >> "$LOG_FILE"
    find "$PROJECT_DIR" -type d -maxdepth 2 | sort >> "$LOG_FILE"
    
    echo "" >> "$LOG_FILE"
    
    # List key files by type
    echo "Key Files:" >> "$LOG_FILE"
    
    # HTML files
    local html_count=$(find "$PROJECT_DIR" -name "*.html" -type f | wc -l)
    echo "  HTML files: $html_count" >> "$LOG_FILE"
    
    # SVG files  
    local svg_count=$(find "$PROJECT_DIR" -name "*.svg" -type f | wc -l)
    echo "  SVG files: $svg_count" >> "$LOG_FILE"
    
    # JavaScript files
    local js_count=$(find "$PROJECT_DIR" -name "*.js" -type f | wc -l)
    echo "  JavaScript files: $js_count" >> "$LOG_FILE"
    
    # JSON files
    local json_count=$(find "$PROJECT_DIR" -name "*.json" -type f | wc -l)
    echo "  JSON files: $json_count" >> "$LOG_FILE"
    
    echo "" >> "$LOG_FILE"
}

# Function to check recent git activity (if git repo)
check_git_activity() {
    if [ -d "$PROJECT_DIR/.git" ]; then
        echo "Git Activity:" >> "$LOG_FILE"
        
        # Recent commits
        echo "  Recent commits (last 5):" >> "$LOG_FILE"
        cd "$PROJECT_DIR" && git log --oneline -5 2>/dev/null >> "$LOG_FILE"
        
        # Current branch
        local current_branch=$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null)
        echo "  Current branch: $current_branch" >> "$LOG_FILE"
        
        # Working directory status
        echo "  Working directory status:" >> "$LOG_FILE"
        cd "$PROJECT_DIR" && git status --porcelain 2>/dev/null >> "$LOG_FILE"
        
        echo "" >> "$LOG_FILE"
    else
        echo "Not a git repository" >> "$LOG_FILE"
        echo "" >> "$LOG_FILE"
    fi
}

# Function to check file sizes and growth
check_file_sizes() {
    echo "File Size Analysis:" >> "$LOG_FILE"
    
    # Large files (> 1MB)
    echo "  Large files (> 1MB):" >> "$LOG_FILE"
    find "$PROJECT_DIR" -type f -size +1M 2>/dev/null | while read file; do
        local size=$(stat -c %s "$file" 2>/dev/null)
        echo "    $file ($(echo "scale=2; $size/1024/1024" | bc -l) MB)" >> "$LOG_FILE"
    done
    
    # Project growth
    local total_size=$(du -sh "$PROJECT_DIR" 2>/dev/null | cut -f1)
    echo "  Total project size: $total_size" >> "$LOG_FILE"
    
    echo "" >> "$LOG_FILE"
}

# Main execution
echo "Starting change detection for project: $PROJECT_DIR" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Run all checks
check_project_structure
check_file_changes "*.html" "HTML"
check_file_changes "*.svg" "SVG" 
check_file_changes "*.js" "JavaScript"
check_file_changes "*.json" "JSON"
check_git_activity
check_file_sizes

echo "Change detection complete." >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Display summary to console
echo "Change detection completed at $TIMESTAMP"
echo "Log saved to: $LOG_FILE"
echo "Recent changes:"
echo "- HTML files: $(find "$PROJECT_DIR" -name "*.html" -mmin -10 -type f 2>/dev/null | wc -l)"
echo "- SVG files: $(find "$PROJECT_DIR" -name "*.svg" -mmin -10 -type f 2>/dev/null | wc -l)"
echo "- JS files: $(find "$PROJECT_DIR" -name "*.js" -mmin -10 -type f 2>/dev/null | wc -l)"
echo "- JSON files: $(find "$PROJECT_DIR" -name "*.json" -mmin -10 -type f 2>/dev/null | wc -l)"