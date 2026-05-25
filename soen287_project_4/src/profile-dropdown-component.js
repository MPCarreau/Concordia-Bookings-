// Profile Dropdown Component - Auto-injecting reusable component
(function () {
  // IIFE to avoid polluting global scope
  // Profile dropdown HTML template
  // SVG https://www.svgrepo.com/svg/437117/person-crop-circle used for person icon
  // SVG https://www.svgrepo.com/svg/437529/calendar used for bookings icon
  // SVG https://www.svgrepo.com/svg/437499/bell-circle used for booking requests icon
  // SVG https://www.svgrepo.com/svg/437546/chart-bar used for statistics icon
  // SVG https://www.svgrepo.com/svg/437251/square-arrow-down used for sign in icon
  // SVG https://www.svgrepo.com/svg/437121/person-crop-circle-badge-plus used for register icon
  // SVG https://www.svgrepo.com/svg/437254/square-arrow-up used for sign out icon
  // SVG https://www.svgrepo.com/svg/437580/clock used for schedule management icon

  const profileDropdownHTML = `
    <div id="profile-container">
        <button id="profile-button">
            <svg fill="currentColor" width="24px" height="24px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 35.9922 C 20.9452 35.9922 15.5077 38.5 13.1405 41.3125 C 9.9999 37.7968 8.1014 33.1328 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9219 33.1563 46.0234 37.8203 42.8593 41.3359 C 40.4921 38.5234 35.0546 35.9922 27.9999 35.9922 Z M 27.9999 32.0078 C 32.4999 32.0547 36.0390 28.2109 36.0390 23.1719 C 36.0390 18.4375 32.4765 14.5 27.9999 14.5 C 23.4999 14.5 19.9140 18.4375 19.9609 23.1719 C 19.9843 28.2109 23.4765 31.9609 27.9999 32.0078 Z"/></svg>
        </button>
        
        <div id="profile-dropdown" class="profile-dropdown">
            <div class="profile-dropdown-header">
                <div class="profile-avatar">
                    <svg fill="currentColor" width="40px" height="40px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 35.9922 C 20.9452 35.9922 15.5077 38.5 13.1405 41.3125 C 9.9999 37.7968 8.1014 33.1328 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9219 33.1563 46.0234 37.8203 42.8593 41.3359 C 40.4921 38.5234 35.0546 35.9922 27.9999 35.9922 Z M 27.9999 32.0078 C 32.4999 32.0547 36.0390 28.2109 36.0390 23.1719 C 36.0390 18.4375 32.4765 14.5 27.9999 14.5 C 23.4999 14.5 19.9140 18.4375 19.9609 23.1719 C 19.9843 28.2109 23.4765 31.9609 27.9999 32.0078 Z"/></svg>
                </div>
                <div class="profile-info">
                    <div id="profile-name">Guest</div>
                    <div id="profile-email">Not logged in</div>
                </div>
            </div>
            
            <div class="profile-dropdown-divider"></div>
            
            <div class="profile-dropdown-menu">
                <a href="profile.html" class="dropdown-item auth-only">
                    <svg fill="currentColor" width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 35.9922 C 20.9452 35.9922 15.5077 38.5 13.1405 41.3125 C 9.9999 37.7968 8.1014 33.1328 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9219 33.1563 46.0234 37.8203 42.8593 41.3359 C 40.4921 38.5234 35.0546 35.9922 27.9999 35.9922 Z M 27.9999 32.0078 C 32.4999 32.0547 36.0390 28.2109 36.0390 23.1719 C 36.0390 18.4375 32.4765 14.5 27.9999 14.5 C 23.4999 14.5 19.9140 18.4375 19.9609 23.1719 C 19.9843 28.2109 23.4765 31.9609 27.9999 32.0078 Z"/></svg>
                    <span>Your Profile</span>
                </a>
                <a href="bookings.html" class="dropdown-item auth-only">
                    <svg fill="currentColor" width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 11.9923 49.5742 L 44.0079 49.5742 C 48.9066 49.5742 51.3671 47.1367 51.3671 42.3086 L 51.3671 13.6914 C 51.3671 8.8633 48.9066 6.4258 44.0079 6.4258 L 11.9923 6.4258 C 7.1173 6.4258 4.6329 8.8398 4.6329 13.6914 L 4.6329 42.3086 C 4.6329 47.1602 7.1173 49.5742 11.9923 49.5742 Z M 11.6642 45.8008 C 9.5782 45.8008 8.4064 44.6992 8.4064 42.5195 L 8.4064 20.4180 C 8.4064 18.2617 9.5782 17.1367 11.6642 17.1367 L 44.3126 17.1367 C 46.3985 17.1367 47.5938 18.2617 47.5938 20.4180 L 47.5938 42.5195 C 47.5938 44.6992 46.3985 45.8008 44.3126 45.8008 Z M 23.4064 25.5508 L 24.7892 25.5508 C 25.6095 25.5508 25.8907 25.3164 25.8907 24.4961 L 25.8907 23.1133 C 25.8907 22.2930 25.6095 22.0352 24.7892 22.0352 L 23.4064 22.0352 C 22.5860 22.0352 22.3282 22.2930 22.3282 23.1133 L 22.3282 24.4961 C 22.3282 25.3164 22.5860 25.5508 23.4064 25.5508 Z M 31.2111 25.5508 L 32.5704 25.5508 C 33.4142 25.5508 33.6720 25.3164 33.6720 24.4961 L 33.6720 23.1133 C 33.6720 22.2930 33.4142 22.0352 32.5704 22.0352 L 31.2111 22.0352 C 30.3907 22.0352 30.1095 22.2930 30.1095 23.1133 L 30.1095 24.4961 C 30.1095 25.3164 30.3907 25.5508 31.2111 25.5508 Z M 38.9923 25.5508 L 40.3751 25.5508 C 41.1954 25.5508 41.4767 25.3164 41.4767 24.4961 L 41.4767 23.1133 C 41.4767 22.2930 41.1954 22.0352 40.3751 22.0352 L 38.9923 22.0352 C 38.1720 22.0352 37.8907 22.2930 37.8907 23.1133 L 37.8907 24.4961 C 37.8907 25.3164 38.1720 25.5508 38.9923 25.5508 Z M 15.6251 33.2149 L 17.0079 33.2149 C 17.8282 33.2149 18.1095 32.9805 18.1095 32.1602 L 18.1095 30.7774 C 18.1095 29.9571 17.8282 29.7227 17.0079 29.7227 L 15.6251 29.7227 C 14.8048 29.7227 14.5235 29.9571 14.5235 30.7774 L 14.5235 32.1602 C 14.5235 32.9805 14.8048 33.2149 15.6251 33.2149 Z M 23.4064 33.2149 L 24.7892 33.2149 C 25.6095 33.2149 25.8907 32.9805 25.8907 32.1602 L 25.8907 30.7774 C 25.8907 29.9571 25.6095 29.7227 24.7892 29.7227 L 23.4064 29.7227 C 22.5860 29.7227 22.3282 29.9571 22.3282 30.7774 L 22.3282 32.1602 C 22.3282 32.9805 22.5860 33.2149 23.4064 33.2149 Z M 31.2111 33.2149 L 32.5704 33.2149 C 33.4142 33.2149 33.6720 32.9805 33.6720 32.1602 L 33.6720 30.7774 C 33.6720 29.9571 33.4142 29.7227 32.5704 29.7227 L 31.2111 29.7227 C 30.3907 29.7227 30.1095 29.9571 30.1095 30.7774 L 30.1095 32.1602 C 30.1095 32.9805 30.3907 33.2149 31.2111 33.2149 Z M 38.9923 33.2149 L 40.3751 33.2149 C 41.1954 33.2149 41.4767 32.9805 41.4767 32.1602 L 41.4767 30.7774 C 41.4767 29.9571 41.1954 29.7227 40.3751 29.7227 L 38.9923 29.7227 C 38.1720 29.7227 37.8907 29.9571 37.8907 30.7774 L 37.8907 32.1602 C 37.8907 32.9805 38.1720 33.2149 38.9923 33.2149 Z M 15.6251 40.9024 L 17.0079 40.9024 C 17.8282 40.9024 18.1095 40.6445 18.1095 39.8242 L 18.1095 38.4414 C 18.1095 37.6211 17.8282 37.3867 17.0079 37.3867 L 15.6251 37.3867 C 14.8048 37.3867 14.5235 37.6211 14.5235 38.4414 L 14.5235 39.8242 C 14.5235 40.6445 14.8048 40.9024 15.6251 40.9024 Z M 23.4064 40.9024 L 24.7892 40.9024 C 25.6095 40.9024 25.8907 40.6445 25.8907 39.8242 L 25.8907 38.4414 C 25.8907 37.6211 25.6095 37.3867 24.7892 37.3867 L 23.4064 37.3867 C 22.5860 37.3867 22.3282 37.6211 22.3282 38.4414 L 22.3282 39.8242 C 22.3282 40.6445 22.5860 40.9024 23.4064 40.9024 Z M 31.2111 40.9024 L 32.5704 40.9024 C 33.4142 40.9024 33.6720 40.6445 33.6720 39.8242 L 33.6720 38.4414 C 33.6720 37.6211 33.4142 37.3867 32.5704 37.3867 L 31.2111 37.3867 C 30.3907 37.3867 30.1095 37.6211 30.1095 38.4414 L 30.1095 39.8242 C 30.1095 40.6445 30.3907 40.9024 31.2111 40.9024 Z"/></svg>
                    <span>My Bookings</span>
                </a>
                <a href="bookingRequests.html" class="dropdown-item auth-only">
                    <svg fill="currentColor" width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 47.9219 C 16.9374 47.9219 8.1014 39.0625 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9454 39.0625 39.0390 47.9219 27.9999 47.9219 Z M 17.4765 36.1328 L 38.5234 36.1328 C 39.7187 36.1328 40.4452 35.5234 40.4452 34.5859 C 40.4452 33.25 39.1093 32.0781 37.9609 30.9063 C 37.0468 29.9453 36.8593 28.0469 36.7655 26.5 C 36.6718 21.4609 35.2890 17.9922 31.8202 16.7266 C 31.2812 15.0156 29.9218 13.6563 27.9999 13.6563 C 26.0780 13.6563 24.6952 15.0156 24.1796 16.7266 C 20.6874 17.9922 19.3280 21.4609 19.2109 26.5 C 19.1171 28.0469 18.9062 29.9453 18.0390 30.9063 C 16.8905 32.1016 15.5546 33.25 15.5546 34.5859 C 15.5546 35.5234 16.2577 36.1328 17.4765 36.1328 Z M 27.9999 41.5469 C 30.2265 41.5469 31.8671 39.9531 32.0312 38.0312 L 23.9687 38.0312 C 24.1327 39.9531 25.7499 41.5469 27.9999 41.5469 Z"/></svg>
                    <span>Booking Requests</span>
                </a>
                <a href="statistics.html" class="dropdown-item admin-only">
                    <svg fill="currentColor" width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 44.8485 49.4564 L 50.7991 49.4564 C 54.2370 49.4564 56.0000 47.8035 56.0000 44.5418 L 56.0000 13.0706 C 56.0000 9.8089 54.2370 8.1339 50.7991 8.1339 L 44.8485 8.1339 C 41.4105 8.1339 39.6475 9.8089 39.6475 13.0706 L 39.6475 44.5418 C 39.6475 47.8035 41.4105 49.4564 44.8485 49.4564 Z M 45.4438 46.1285 C 43.7467 46.1285 43.1518 45.5555 43.1518 43.9026 L 43.1518 13.7097 C 43.1518 12.0347 43.7467 11.4618 45.4438 11.4618 L 50.2259 11.4618 C 51.9008 11.4618 52.4962 12.0347 52.4962 13.7097 L 52.4962 43.9026 C 52.4962 45.5555 51.9008 46.1285 50.2259 46.1285 Z M 25.0139 49.4564 L 30.9643 49.4564 C 34.4023 49.4564 36.1875 47.8035 36.1875 44.5418 L 36.1875 19.5058 C 36.1875 16.2441 34.4023 14.5692 30.9643 14.5692 L 25.0139 14.5692 C 21.5758 14.5692 19.8348 16.2441 19.8348 19.5058 L 19.8348 44.5418 C 19.8348 47.8035 21.5758 49.4564 25.0139 49.4564 Z M 25.6089 46.1285 C 23.9340 46.1285 23.3389 45.5555 23.3389 43.9026 L 23.3389 20.1450 C 23.3389 18.4700 23.9340 17.8970 25.6089 17.8970 L 30.3913 17.8970 C 32.0883 17.8970 32.6833 18.4700 32.6833 20.1450 L 32.6833 43.9026 C 32.6833 45.5555 32.0883 46.1285 30.3913 46.1285 Z M 5.2011 49.4564 L 11.1515 49.4564 C 14.5896 49.4564 16.3526 47.8035 16.3526 44.5418 L 16.3526 25.9191 C 16.3526 22.6574 14.5896 20.9824 11.1515 20.9824 L 5.2011 20.9824 C 1.7631 20.9824 0 22.6574 0 25.9191 L 0 44.5418 C 0 47.8035 1.7631 49.4564 5.2011 49.4564 Z M 5.7962 46.1285 C 4.0992 46.1285 3.5041 45.5555 3.5041 43.9026 L 3.5041 26.5582 C 3.5041 24.8833 4.0992 24.3103 5.7962 24.3103 L 10.5786 24.3103 C 12.2535 24.3103 12.8485 24.8833 12.8485 26.5582 L 12.8485 43.9026 C 12.8485 45.5555 12.2535 46.1285 10.5786 46.1285 Z"/></svg>
                    <span>Statistics</span>
                </a>
                <a href="adminSchedule.html" class="dropdown-item admin-only">
                    <svg fill="currentColor" width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 47.9219 C 16.9374 47.9219 8.1014 39.0625 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9454 39.0625 39.0390 47.9219 27.9999 47.9219 Z M 15.7187 30.5312 L 27.9765 30.5312 C 28.8905 30.5312 29.6171 29.8281 29.6171 28.8906 L 29.6171 13.0937 C 29.6171 12.1797 28.8905 11.4766 27.9765 11.4766 C 27.0624 11.4766 26.3593 12.1797 26.3593 13.0937 L 26.3593 27.2734 L 15.7187 27.2734 C 14.8046 27.2734 14.1014 27.9766 14.1014 28.8906 C 14.1014 29.8281 14.8046 30.5312 15.7187 30.5312 Z"/></svg>
                    <span>Schedule Management</span>
                </a>
                
                <div class="profile-dropdown-divider"></div>
                
                <a href="login.html" class="dropdown-item no-auth-only">
                    <svg fill="currentColor" width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 28.0117 37.8906 C 28.4805 37.8906 28.9023 37.7266 29.3711 37.2578 L 37.2930 29.6172 C 37.6445 29.2656 37.8320 28.8906 37.8320 28.3750 C 37.8320 27.4141 37.1055 26.7344 36.1211 26.7344 C 35.6758 26.7344 35.1836 26.9219 34.8555 27.2969 L 31.3164 31.0703 L 29.7226 32.7344 L 29.8633 29.2422 L 29.8633 4.5156 C 29.8633 3.5313 29.0195 2.7109 28.0117 2.7109 C 27.0039 2.7109 26.1367 3.5313 26.1367 4.5156 L 26.1367 29.2422 L 26.3008 32.7344 L 24.7070 31.0703 L 21.1445 27.2969 C 20.8164 26.9219 20.3242 26.7344 19.8555 26.7344 C 18.8711 26.7344 18.1679 27.4141 18.1679 28.3750 C 18.1679 28.8906 18.3789 29.2656 18.7305 29.6172 L 26.6523 37.2578 C 27.1211 37.7266 27.5195 37.8906 28.0117 37.8906 Z M 14.5586 53.2891 L 41.4414 53.2891 C 46.3633 53.2891 48.8008 50.8516 48.8008 46.0234 L 48.8008 21.8360 C 48.8008 17.0078 46.3633 14.5703 41.4414 14.5703 L 34.6914 14.5703 L 34.6914 18.3438 L 41.3945 18.3438 C 43.6914 18.3438 45.0274 19.6094 45.0274 22.0469 L 45.0274 45.8359 C 45.0274 48.2734 43.6914 49.5156 41.3945 49.5156 L 14.6289 49.5156 C 12.2852 49.5156 10.9726 48.2734 10.9726 45.8359 L 10.9726 22.0469 C 10.9726 19.6094 12.2852 18.3438 14.6289 18.3438 L 21.3320 18.3438 L 21.3320 14.5703 L 14.5586 14.5703 C 9.6836 14.5703 7.1992 17.0078 7.1992 21.8360 L 7.1992 46.0234 C 7.1992 50.8750 9.6836 53.2891 14.5586 53.2891 Z"/></svg>
                    <span>Sign In</span>
                </a>
                <a href="register.html" class="dropdown-item no-auth-only">
                    <svg fill="currentColor" width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 33.7169 50.6051 C 45.9141 50.6051 56.0000 40.4968 56.0000 28.2994 C 56.0000 16.1245 45.8920 5.9937 33.6944 5.9937 C 22.4180 5.9937 12.9611 14.6419 11.5909 25.5365 C 12.1749 25.5365 12.7365 25.5814 13.2981 25.6712 C 13.9944 25.7611 14.6908 25.9183 15.3646 26.1205 C 16.4204 16.9332 24.1926 9.8124 33.6944 9.8124 C 43.9598 9.8124 52.1812 18.0563 52.2037 28.2994 C 52.2037 33.0840 50.4294 37.3969 47.5090 40.6765 C 44.1171 37.8461 39.0406 35.9593 33.6944 35.9593 C 31.1785 35.9593 28.3258 36.4984 25.6751 37.4418 C 25.8324 38.2954 25.9222 39.1715 25.9222 40.0475 C 25.9222 42.9902 25.0012 45.7531 23.4513 48.0668 C 26.5287 49.6616 30.0329 50.6051 33.7169 50.6051 Z M 33.6944 32.0956 C 38.0073 32.0956 41.2644 28.3668 41.2644 23.6720 C 41.2644 19.2469 37.9399 15.4057 33.6944 15.4057 C 29.4714 15.4057 26.1244 19.2469 26.1244 23.6720 C 26.1244 28.3668 29.4040 32.0956 33.6944 32.0956 Z M 11.4112 51.4587 C 17.6110 51.4587 22.8224 46.2922 22.8224 40.0475 C 22.8224 33.8028 17.6783 28.6363 11.4112 28.6363 C 5.1665 28.6363 0 33.8028 0 40.0475 C 0 46.3372 5.1665 51.4587 11.4112 51.4587 Z M 11.4336 47.4603 C 10.6474 47.4603 9.9511 46.9212 9.9511 46.0676 L 9.9511 41.4178 L 5.6607 41.4178 C 4.8969 41.4178 4.2679 40.7888 4.2679 40.0475 C 4.2679 39.2838 4.8969 38.6548 5.6607 38.6548 L 9.9511 38.6548 L 9.9511 34.0050 C 9.9511 33.1739 10.6474 32.6347 11.4336 32.6347 C 12.1974 32.6347 12.8937 33.1739 12.8937 34.0050 L 12.8937 38.6548 L 17.1841 38.6548 C 17.9479 38.6548 18.5544 39.2838 18.5544 40.0475 C 18.5544 40.7888 17.9479 41.4178 17.1841 41.4178 L 12.8937 41.4178 L 12.8937 46.0676 C 12.8937 46.9212 12.1974 47.4603 11.4336 47.4603 Z"/></svg>
                    <span>Register</span>
                </a>
                <a href="#" class="dropdown-item auth-only" id="logout-btn">
                    <svg fill="currentColor" width="20px" height="20px" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path d="M 28.0117 36.0975 C 29.0195 36.0975 29.8633 35.2538 29.8633 34.2694 L 29.8633 10.1991 L 29.7226 6.7069 L 31.3164 8.3710 L 34.8555 12.1444 C 35.1836 12.5194 35.6758 12.7069 36.1211 12.7069 C 37.1055 12.7069 37.8320 12.0038 37.8320 11.0663 C 37.8320 10.5507 37.6445 10.1757 37.2930 9.8241 L 29.3711 2.1835 C 28.9023 1.7146 28.4805 1.5509 28.0117 1.5509 C 27.5195 1.5509 27.1211 1.7146 26.6523 2.1835 L 18.7305 9.8241 C 18.3789 10.1757 18.1679 10.5507 18.1679 11.0663 C 18.1679 12.0038 18.8711 12.7069 19.8555 12.7069 C 20.3242 12.7069 20.8164 12.5194 21.1445 12.1444 L 24.7070 8.3710 L 26.3008 6.6835 L 26.1367 10.1991 L 26.1367 34.2694 C 26.1367 35.2538 27.0039 36.0975 28.0117 36.0975 Z M 14.5586 54.4491 L 41.4414 54.4491 C 46.3633 54.4491 48.8008 52.0116 48.8008 47.1835 L 48.8008 24.0741 C 48.8008 19.2460 46.3633 16.8085 41.4414 16.8085 L 34.9258 16.8085 L 34.9258 20.5819 L 41.3945 20.5819 C 43.6914 20.5819 45.0274 21.8241 45.0274 24.2616 L 45.0274 46.9960 C 45.0274 49.4335 43.6914 50.6757 41.3945 50.6757 L 14.6289 50.6757 C 12.2852 50.6757 10.9726 49.4335 10.9726 46.9960 L 10.9726 24.2616 C 10.9726 21.8241 12.2852 20.5819 14.6289 20.5819 L 21.0976 20.5819 L 21.0976 16.8085 L 14.5586 16.8085 C 9.6836 16.8085 7.1992 19.2226 7.1992 24.0741 L 7.1992 47.1835 C 7.1992 52.0350 9.6836 54.4491 14.5586 54.4491 Z"/></svg>
                    <span>Sign Out</span>
                </a>
            </div>
        </div>
    </div>
  `;

  // Function to inject the profile dropdown into the page on load
  function initProfileDropdown() {
    const header = document.querySelector("header");
    if (!header) {
      console.warn("Header element not found. Profile dropdown not injected.");
      return;
    }

    // Check if profile container already exists (to avoid duplicates when called multiple times)
    if (document.getElementById("profile-container")) {
      console.warn("Profile dropdown already exists. Skipping injection.");
      return;
    }

    // Create a temporary container to parse the HTML
    const temp = document.createElement("div");
    temp.innerHTML = profileDropdownHTML;
    const profileContainer = temp.firstElementChild;

    // Insert the profile dropdown into the header
    header.appendChild(profileContainer);

    // Initialize dropdown functionality
    initDropdownFunctionality();
  }

  // Profile Dropdown Functionality
  function initDropdownFunctionality() {
    const profileButton = document.getElementById("profile-button");
    const profileDropdown = document.getElementById("profile-dropdown");
    const logoutBtn = document.getElementById("logout-btn");

    if (!profileButton || !profileDropdown) {
      console.warn("Profile dropdown elements not found.");
      return;
    }

    // Toggle dropdown on button click
    profileButton.addEventListener("click", function (e) {
      e.stopPropagation();
      profileDropdown.classList.toggle("show"); // Toggle visibility: Look in style.css for .show class in .profile-dropdown
    });

    // Update profile information based on session
    function updateProfileInfo() {
      const userSession = localStorage.getItem("userSession");
      const adminSession = localStorage.getItem("adminSession");
      const session = adminSession || userSession;

      const profileName = document.getElementById("profile-name");
      const profileEmail = document.getElementById("profile-email");
      // Items to show/hide based on auth status and role: Look for these classes in the HTML above
      const authOnlyItems = document.querySelectorAll(
        ".dropdown-item.auth-only"
      );
      const noAuthOnlyItems = document.querySelectorAll(
        ".dropdown-item.no-auth-only"
      );
      const adminOnlyItems = document.querySelectorAll(
        ".dropdown-item.admin-only"
      );

      if (session) {
        try {
          const user = JSON.parse(session);

          // Update profile info
          profileName.textContent = user.firstName || "User";
          profileEmail.textContent = user.email || "user@example.com";

          // Show authenticated items
          authOnlyItems.forEach((item) => {
            item.style.display = "flex";
          });

          // Hide non-authenticated items
          noAuthOnlyItems.forEach((item) => {
            item.style.display = "none";
          });

          // Show admin items only for admins
          if (user.isAdmin === true) {
            adminOnlyItems.forEach((item) => {
              item.style.display = "flex";
            });
          } else {
            adminOnlyItems.forEach((item) => {
              item.style.display = "none";
            });
          }
        } catch (error) {
          console.error("Error parsing user session:", error);
          setGuestMode();
        }
      } else {
        setGuestMode();
      }
    }

    // Set guest mode (not logged in)
    function setGuestMode() {
      const profileName = document.getElementById("profile-name");
      const profileEmail = document.getElementById("profile-email");

      // Items to show/hide based on auth status and role: Look for these classes in the HTML above
      const authOnlyItems = document.querySelectorAll(
        ".dropdown-item.auth-only"
      );
      const noAuthOnlyItems = document.querySelectorAll(
        ".dropdown-item.no-auth-only"
      );
      const adminOnlyItems = document.querySelectorAll(
        ".dropdown-item.admin-only"
      );

      profileName.textContent = "Guest";
      profileEmail.textContent = "Not logged in";

      // Hide authenticated items
      authOnlyItems.forEach((item) => {
        item.style.display = "none";
      });

      // Show non-authenticated items
      noAuthOnlyItems.forEach((item) => {
        item.style.display = "flex";
      });

      // Hide admin items
      adminOnlyItems.forEach((item) => {
        item.style.display = "none";
      });
    }

    // Logout functionality
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("userSession");
        localStorage.removeItem("adminSession");
        window.location.href = "index.html";
      });
    }

    // Initial update
    updateProfileInfo();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfileDropdown);
  } else {
    initProfileDropdown();
  }
})();
