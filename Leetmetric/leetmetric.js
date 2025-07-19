document.addEventListener("DOMContentLoaded",function(){
      const searchButton = document.getElementById("search-bt");
      const usernameInput = document.getElementById("user");
      const statsContainer = document.querySelector(".stats-container");
      const easyProgressCircle = document.querySelector(".easy-progress");
      const mediumProgressCircle = document.querySelector(".medium-progress");
      const hardProgressCircle = document.querySelector(".hard-progress");
      const easyLabel = document.getElementById("easy-label");
      const mediumLabel = document.getElementById("medium-label");
      const hardLabel = document.getElementById("hard-label");
      const cardStatsContainer = document.querySelector(".stats-cards");


      function validateUsername(username){
            if(username.trim()==""){
                alert("Username should not be empty");
                return false;
            }
           const regex = /^[a-zA-Z0-9_-]{1,15}$/;
           const isMatching = regex.test(username);
           if(!isMatching){
            alert("Invalid Username");
           }
           return isMatching;
      }


      async function fetchUserDetail(username){
          
          
          // const url = `https://leetcode-stats-api.herokuapp.com/${username}`
          try{
              searchButton.textContent = "Searching...";
              searchButton.disabled = true;

              // const response = await fetch(url);
              // url for  temporary access to the demo server.
              // https://cors-anywhere.herokuapp.com/corsdemo
              const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
              const targetUrl = 'https://leetcode.com/graphql/';

              const myHeaders = new Headers();
              myHeaders.append("content-type","application/json");
              
              const graphql = JSON.stringify({
               query:`query userSessionProgress($username: String!)
               {allQuestionsCount
                {
                  difficulty
                   count
                    }
                    matchedUser(username: $username) {
                     submitStats {
                     acSubmissionNum {
                     difficulty
                      count 
                       submissions
                         }
                       totalSubmissionNum {
                        difficulty
                          count
                            submissions
                              }
                             }
                             }
                             }`,
                  variables: {"username":`${username}`}
                })
                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body:graphql,
                    redirect: "follow"
                };
            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            if(!response.ok){
                throw new Error("Unable to fetch the user detail");
            }
            const parsedData = await response.json();
            console.log("Logging data: ",parsedData);

            displayUserData(parsedData);
        }
        catch(error){
                console.error("Fetch error:",error);
                statsContainer.innerHTML = `<p>${error.message}</p>`;
        }
        finally{
                searchButton.textContent = "Search";
             searchButton.disabled = false;
        }
      }

      function updateProgress(solved, total, label, circle){
           const progressDegree = (solved/total)*100;
           circle.style.setProperty("--progress-degree",`${progressDegree}%`);
           label.textContent = `${solved}/${total}`;
      }

      function displayUserData(parsedData){
            const totalQues = parsedData.data.allQuestionsCount[0].count;
            const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
            const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
            const totalHardQues = parsedData.data.allQuestionsCount[3].count;
            
            const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
            const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
            const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
            const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;
                         
           updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
           updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
           updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

           const cardsData = [
            {label: "Overall Submission",value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            {label: "Overall Easy Submission",value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            {label: "Overall Medium Submission",value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            {label: "Overall Hard Submission",value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions }
           ];

           console.log("card ka data:",cardsData);

           cardStatsContainer.innerHTML = cardsData.map(
            data =>
              `<div class ="card">
              <h30>${data.label}</h3>
              <p>${data.value}</p>
              </div>`
           ).join("")
          
      }
    searchButton.addEventListener("click",function(){
         const username = usernameInput.value;
         console.log("loggin username: ",username);
         if(validateUsername(username)){
               fetchUserDetail(username);
         }
    })
})