#!/bin/bash
# Railway Database Import Script

echo "🚀 Railway Database Import Script"
echo "=================================="
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

echo "📊 Getting Railway MySQL credentials..."
echo ""

# Get credentials from Railway
railway variables > .railway_vars.tmp

# Parse Railway table format (extracts value between │ symbols)
MYSQL_HOST=$(grep "RAILWAY_TCP_PROXY_DOMAIN" .railway_vars.tmp | awk -F'│' '{print $3}' | xargs)
MYSQL_PORT=$(grep "RAILWAY_TCP_PROXY_PORT" .railway_vars.tmp | awk -F'│' '{print $3}' | xargs)
MYSQL_USER=$(grep "MYSQLUSER" .railway_vars.tmp | grep -v "MYSQL_URL" | awk -F'│' '{print $3}' | xargs)
MYSQL_PASSWORD=$(grep "MYSQL_ROOT_PASSWORD" .railway_vars.tmp | awk -F'│' '{print $3}' | xargs)
MYSQL_DATABASE=$(grep "MYSQL_DATABASE" .railway_vars.tmp | grep -v "MYSQL_URL" | awk -F'│' '{print $3}' | xargs)

rm .railway_vars.tmp

if [ -z "$MYSQL_HOST" ]; then
    echo "❌ Could not get MySQL credentials. Make sure MySQL is added to your Railway project."
    echo "   Run: railway add"
    echo "   Then select: MySQL"
    exit 1
fi

echo "✅ Credentials found!"
echo "   Host: $MYSQL_HOST"
echo "   Port: $MYSQL_PORT"
echo "   Database: $MYSQL_DATABASE"
echo ""

# Check if mysql command exists
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL client not found. Using Railway CLI instead..."
    echo ""
    echo "📥 Importing schema via Railway CLI..."
    echo ""

    railway run bash -c "mysql -u root -p\$MYSQLPASSWORD \$MYSQLDATABASE < database/complete_setup_all_data.sql"

    echo ""
    echo "📥 Importing bookings data..."
    echo ""

    railway run bash -c "mysql -u root -p\$MYSQLPASSWORD \$MYSQLDATABASE < database/bookings_data.sql"
else
    echo "📥 Importing schema..."
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < database/complete_setup_all_data.sql

    if [ $? -eq 0 ]; then
        echo "✅ Schema imported successfully!"
    else
        echo "❌ Schema import failed!"
        exit 1
    fi

    echo ""
    echo "📥 Importing bookings data..."
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < database/bookings_data.sql

    if [ $? -eq 0 ]; then
        echo "✅ Bookings data imported successfully!"
    else
        echo "❌ Bookings data import failed!"
        exit 1
    fi
fi

echo ""
echo "🎉 Database import complete!"
echo ""
echo "📊 Verifying import..."
echo ""

# Verify import
railway run bash -c "mysql -u root -p\$MYSQLPASSWORD \$MYSQLDATABASE -e 'SELECT COUNT(*) as user_count FROM users; SELECT COUNT(*) as resource_count FROM resources; SELECT COUNT(*) as booking_count FROM bookings;'"

echo ""
echo "✅ All done! Your Railway database is ready."
echo ""
echo "Next step: Deploy your backend"
echo "   railway up"

