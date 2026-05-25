#!/bin/bash
# Auto-fix script - finds and updates server.php wherever it is

echo "🔍 Searching for your deployed soen287_project_2..."

# Search for the project in common locations
LOCATIONS=(
    "/Applications/XAMPP/htdocs"
    "/Applications/XAMPP/xamppfiles/htdocs"
    "/Applications/XAMPP/xamppfiles/apache2/htdocs"
    "/opt/lampp/htdocs"
    "/Library/WebServer/Documents"
    "$HOME/Sites"
)

FOUND=""
for loc in "${LOCATIONS[@]}"; do
    if [ -f "$loc/soen287_project_2/src/server.php" ]; then
        FOUND="$loc/soen287_project_2"
        echo "✅ Found project at: $FOUND"
        break
    fi
done

if [ -z "$FOUND" ]; then
    echo "❌ Could not find deployed project automatically."
    echo ""
    echo "Please run this command manually:"
    echo "sudo cp /Users/michaelkauzman/WebstormProjects/soen287_project_2/src/server.php /PATH/TO/YOUR/htdocs/soen287_project_2/src/"
    echo ""
    echo "Where /PATH/TO/YOUR/htdocs is your Apache document root."
    exit 1
fi

echo ""
echo "📝 Updating server.php with the fix..."
sudo cp /Users/michaelkauzman/WebstormProjects/soen287_project_2/src/server.php "$FOUND/src/"

if [ $? -eq 0 ]; then
    echo "✅ server.php updated successfully!"
    echo ""
    echo "🔄 Now restart Apache in XAMPP Control Panel"
    echo ""
    echo "🧪 Then test: http://localhost/soen287_project_2/api/health"
else
    echo "❌ Failed to copy file. Try running with sudo:"
    echo "sudo $0"
fi

