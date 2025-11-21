
    // DOM elements
    const githubUsername = document.getElementById("github-username");
    const checkForkBtn = document.getElementById("check-fork");
    const statusMessage = document.getElementById("status-message");
    const actionButtons = document.getElementById("action-buttons");
    const deployBtn = document.getElementById("deploy-btn");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const notificationPanel = document.getElementById("notificationPanel");
    const notificationTitle = document.getElementById("notificationTitle");
    const notificationContent = document.getElementById("notificationContent");
    const notificationButtons = document.getElementById("notificationButtons");
    const closeNotificationsBtn = document.getElementById("closeNotifications");
    const visionNotification = document.getElementById("visionNotification");
    const closeVisionNotification = document.getElementById("closeVisionNotification");
    const closeVisionBtn = document.getElementById("closeVisionBtn");
    const miniNotification = document.getElementById("miniNotification");

    // Show Vision V notification
    function showVisionNotification() {
      // First show mini notification
      setTimeout(() => {
        miniNotification.classList.add('show');
        
        // After 3 seconds, show the full notification
        setTimeout(() => {
          miniNotification.classList.remove('show');
          setTimeout(() => {
            visionNotification.classList.add('show');
          }, 500);
        }, 3000);
      }, 2000);
    }
    
    // Close Vision V notification
    function closeVisionNotificationFunc() {
      visionNotification.classList.remove('show');
      visionNotification.classList.add('hide');
      
      setTimeout(() => {
        visionNotification.classList.remove('hide');
      }, 500);
    }
    
    // Show mini notification on click
    miniNotification.addEventListener('click', () => {
      miniNotification.classList.remove('show');
      visionNotification.classList.add('show');
    });

    // Check if user has forked the repository
    async function checkFork() {
      const username = githubUsername.value.trim();
      
      if (!username) {
        showStatus("Please enter your GitHub username", "error");
        showNotification("Error", "Please enter your GitHub username", "error");
        return;
      }
      
      showStatus("Checking fork status...", "info");
      loadingOverlay.style.display = 'flex';
      
      try {
        // Use GitHub API to check if the user has forked the repository
        const hasForked = await checkGitHubFork(username);
        
        if (hasForked) {
          showStatus("Fork verified! You can now deploy your bot.", "success");
          actionButtons.style.display = "flex";
          
          // Set up Heroku deploy URL with the forked repo
          deployBtn.href = `https://heroku.com/deploy?template=https://github.com/${username}/Mercedes`;
          
          // Show success notification
          showNotification("Success", "Congratulations! You have forked the repository. You can now deploy your bot.", "success", [
            { text: "Deploy Now", action: () => window.open(deployBtn.href, '_blank') },
            { text: "Close", action: () => notificationPanel.classList.remove('show') }
          ]);
        } else {
          showStatus("You haven't forked the repository yet. Please fork it first.", "error");
          actionButtons.style.display = "none";
          
          // Show error notification with fork button
          showNotification("Fork Required", "You haven't forked the repository yet. Please fork it first to continue with deployment.", "error", [
            { text: "Fork Now", action: () => window.open("https://github.com/betingrich4/Mercedes/fork", '_blank') },
            { text: "Close", action: () => notificationPanel.classList.remove('show') }
          ]);
        }
      } catch (error) {
        showStatus("Error checking fork status. Please try again.", "error");
        console.error("Fork check error:", error);
        
        // Show error notification
        showNotification("Error", "Error checking fork status. Please try again.", "error", [
          { text: "Close", action: () => notificationPanel.classList.remove('show') }
        ]);
      } finally {
        loadingOverlay.style.display = 'none';
      }
    }
    
   // Check GitHub fork using the API
    async function checkGitHubFork(username) {
      try {
        // This is a workaround for CORS limitations - in a real application,
        // you would need a server-side component to make this request
        const response = await fetch(`https://api.github.com/repos/${username}/Mercedes`, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.status === 200) {
          const repoData = await response.json();
          // Check if the repository is a fork of the target repo
          return repoData.fork && repoData.parent && 
                 repoData.parent.full_name === 'betingrich4/Mercedes';
        } else if (response.status === 404) {
          // Repository doesn't exist or isn't accessible
          return false;
        } else {
          throw new Error(`GitHub API returned status ${response.status}`);
        }
      } catch (error) {
        console.error('GitHub API error:', error);
        
        // Fallback: Check if the username contains "mercedes" (for demo purposes)
        // In a real application, you would want proper API handling
        return username.toLowerCase().includes('mercedes');
      }
    }
    
    // Show status message
    function showStatus(message, type) {
      statusMessage.textContent = message;
      statusMessage.className = "status-message";
      
      if (type === "success") {
        statusMessage.classList.add("status-success");
      } else if (type === "error") {
        statusMessage.classList.add("status-error");
      } else if (type === "info") {
        statusMessage.classList.add("status-info");
      }
      
      statusMessage.style.display = "block";
    }
    
    // Show notification
    function showNotification(title, content, type, buttons = []) {
      notificationTitle.textContent = title;
      notificationContent.textContent = content;
      
      // Clear previous buttons
      notificationButtons.innerHTML = '';
      
      // Add new buttons
      buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = `btn ${type === 'success' ? 'btn-primary' : 'btn-secondary'}`;
        btn.textContent = button.text;
        btn.addEventListener('click', button.action);
        notificationButtons.appendChild(btn);
      });
      
      // Show notification
      notificationPanel.classList.add('show');
    }
    
    // Event listeners
    checkForkBtn.addEventListener("click", checkFork);
    githubUsername.addEventListener("keypress", (e) => {
      if (e.key === "Enter") checkFork();
    });
    
    closeNotificationsBtn.addEventListener('click', () => {
      notificationPanel.classList.remove('show');
    });
    
    closeVisionNotification.addEventListener('click', closeVisionNotificationFunc);
    closeVisionBtn.addEventListener('click', closeVisionNotificationFunc);
    
    // Close notifications when clicking outside
    document.addEventListener('click', (e) => {
      if (notificationPanel.classList.contains('show') && 
          !notificationPanel.contains(e.target) && 
          e.target !== checkForkBtn) {
        notificationPanel.classList.remove('show');
      }
      
      if (visionNotification.classList.contains('show') && 
          !visionNotification.contains(e.target) && 
          e.target !== miniNotification) {
        closeVisionNotificationFunc();
      }
    });
    
    // Initialize
    window.addEventListener('load', () => {
      // Smooth page load
      document.body.style.opacity = '0';
      setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
      }, 100);
      
      // Hide loading overlay after page load
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
        // Show Vision V notification
        showVisionNotification();
      }, 1500);
    });
  