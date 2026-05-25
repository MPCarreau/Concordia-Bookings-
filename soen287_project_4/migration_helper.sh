#!/bin/bash

# SOEN287 Project - Migration Helper Script
# This script helps automate the migration from Cloudflare D1 to MySQL

echo "=========================================="
echo "SOEN287 Project - Migration Helper"
echo "=========================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if MySQL is running
check_mysql() {
    echo "Checking MySQL connection..."
    if mysql -uroot -e "SELECT 1" >/dev/null 2>&1; then
        echo "✅ MySQL is running"
        return 0
    else
        echo "❌ MySQL is not running or not accessible"
        echo "   Please start MySQL in XAMPP Control Panel"
        return 1
    fi
}

# Create database and tables
setup_database() {
    echo ""
    echo "Setting up database..."

    if [ ! -f "database/mysql_schema.sql" ]; then
        echo "❌ Error: mysql_schema.sql not found in database/ directory"
        return 1
    fi

    mysql -uroot < database/mysql_schema.sql

    if [ $? -eq 0 ]; then
        echo "✅ Database 'soen287_project' created successfully"
        echo "✅ All tables created"
        echo "✅ Sample data inserted"
        return 0
    else
        echo "❌ Error creating database"
        return 1
    fi
}

# Check configuration
check_config() {
    echo ""
    echo "Checking configuration..."

    if grep -q "YOUR_SENDGRID_API_KEY_HERE" src/config.php; then
        echo "⚠️  Warning: SendGrid API key not configured"
        echo "   Edit src/config.php and add your SendGrid API key"
    else
        echo "✅ SendGrid API key configured"
    fi
}

# Export data from Cloudflare D1 (optional)
export_d1_data() {
    echo ""
    echo "Do you want to export data from Cloudflare D1? (y/n)"
    read -r response

    if [ "$response" = "y" ]; then
        if command_exists npx; then
            echo "Exporting users from D1..."
            npx wrangler d1 execute db-soen287-1 --remote --command "SELECT * FROM users" > d1_users_export.txt
            echo "✅ Users exported to d1_users_export.txt"

            echo "Exporting resources from D1..."
            npx wrangler d1 execute db-soen287-1 --remote --command "SELECT * FROM resources" > d1_resources_export.txt
            echo "✅ Resources exported to d1_resources_export.txt"

            echo "Exporting bookings from D1..."
            npx wrangler d1 execute db-soen287-1 --remote --command "SELECT * FROM bookings" > d1_bookings_export.txt
            echo "✅ Bookings exported to d1_bookings_export.txt"

            echo ""
            echo "Note: You'll need to manually import this data into MySQL using phpMyAdmin"
        else
            echo "❌ npx not found. Please install Node.js to export D1 data"
        fi
    fi
}

# Merge server parts
merge_server_files() {
    echo ""
    echo "Do you want to merge server_part2.php into server.php? (y/n)"
    read -r response

    if [ "$response" = "y" ]; then
        if [ -f "src/server_part2.php" ]; then
            echo "⚠️  This requires manual merging. Please:"
            echo "   1. Open src/server.php"
            echo "   2. Find '// Continue with Part 2...'"
            echo "   3. Copy routes from src/server_part2.php"
            echo "   4. Paste before '// Route not found'"
        else
            echo "✅ server_part2.php not found (may already be merged)"
        fi
    fi
}

# Test API endpoint
test_api() {
    echo ""
    echo "Testing API endpoint..."

    # Try localhost/phpmyadmin first (XAMPP htdocs)
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/soen287_project_2/api/health 2>/dev/null)

    if [ "$response" = "200" ]; then
        echo "✅ API is accessible at: http://localhost/soen287_project_2/api/health"
        return 0
    fi

    # Try PHP built-in server
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/src/server.php/api/health 2>/dev/null)

    if [ "$response" = "200" ]; then
        echo "✅ API is accessible at: http://localhost:8080/src/server.php/api/health"
        return 0
    fi

    echo "⚠️  API not accessible. Make sure:"
    echo "   - Apache is running in XAMPP"
    echo "   - Or start PHP server with: php -S localhost:8080"
}

# Main menu
main_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1. Check MySQL connection"
    echo "2. Setup database (create tables and sample data)"
    echo "3. Export data from Cloudflare D1 (optional)"
    echo "4. Check configuration"
    echo "5. Test API endpoint"
    echo "6. Run full setup (options 1, 2, 4)"
    echo "7. Exit"
    echo ""
    echo -n "Enter your choice (1-7): "
    read -r choice

    case $choice in
        1)
            check_mysql
            main_menu
            ;;
        2)
            check_mysql && setup_database
            main_menu
            ;;
        3)
            export_d1_data
            main_menu
            ;;
        4)
            check_config
            main_menu
            ;;
        5)
            test_api
            main_menu
            ;;
        6)
            check_mysql && setup_database && check_config
            echo ""
            echo "✅ Setup complete!"
            echo ""
            echo "Next steps:"
            echo "1. Add your SendGrid API key to src/config.php"
            echo "2. Merge server_part2.php into server.php"
            echo "3. Update frontend API URLs in JavaScript files"
            echo "4. Test the application"
            main_menu
            ;;
        7)
            echo ""
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            main_menu
            ;;
    esac
}

# Run main menu
main_menu

