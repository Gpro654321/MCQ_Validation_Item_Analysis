function getSheetId() {
  Logger.log("INSIDE getSheetId")
  var scriptProperties = PropertiesService.getScriptProperties()
  var sheetId = scriptProperties.getProperty("sheetId")
  Logger.log(sheetId)
  return sheetId
}

function getSheetData(sheetName) {
  Logger.log("INSIDE getSheetData")
  var sheetId = getSheetId()
  var ss = SpreadsheetApp.openById(sheetId)
  var sheet = ss.getSheetByName(sheetName)

  var lastRow = sheet.getLastRow()
  var lastCol = sheet.getLastColumn()

  var reqRange = sheet.getRange(1,1,lastRow,lastCol)
  var reqData = reqRange.getValues()

  Logger.log(reqData)
  return reqData
}

function calculateScore(individualStudentResponse,answerKey){
  Logger.log("INSIDE calculateScore")
  // the student responses first column is the students roll number
  // the last column of each response will be the score

  individualStudentResponseWithoutRollNo = individualStudentResponse.slice(1)

  if (individualStudentResponseWithoutRollNo.length !== answerKey.length) {
    throw new Error("Arrays must have the same length");
  }

  // Count the number of matching elements
  let count = 0;
  for (let i = 0; i < individualStudentResponseWithoutRollNo.length; i++) {
    if (individualStudentResponseWithoutRollNo[i] === answerKey[i]) {
      count++;
    }
  }
  Logger.log("score " + count)
  return count;
}

function calculateScoreForAll(){
  Logger.log("INSIDE calculateScoreForAll")
  
  var allStudentResponses = getSheetData('StudentResponses')
  var answerKey = getSheetData('AnswerKey')[0]

  var scoresArray = []
  var i;
  for(i=0;i<allStudentResponses.length;i++){
    var individualScore = calculateScore(allStudentResponses[i],answerKey)
    scoresArray.push([individualScore])
  }
  
  var sheetId = getSheetId()
  var ss = SpreadsheetApp.openById(sheetId)
  var sheet = ss.getSheetByName('StudentResponses')
  var lastCol = sheet.getLastColumn()
  var scoresArrayLen = scoresArray.length
  var reqRange = sheet.getRange(1,(lastCol+1),scoresArrayLen,1)
  var setData = reqRange.setValues(scoresArray)

  return
}

function sortByScore(){
  Logger.log("INSIDE sortByScore")
  // assumes that scores have been calculated previously

  var sheetId = getSheetId()
  var ss = SpreadsheetApp.openById(sheetId)
  var sheet = ss.getSheetByName('StudentResponses')
  var lastRow = sheet.getLastRow()
  var lastCol = sheet.getLastColumn()
  var reqRange = sheet.getRange(1,1,lastRow,lastCol)
  var sortedRange = reqRange.sort({column: lastCol, ascending: false})


  var setData = reqRange.setValues(sortedRange.getValues())

}

function difficultyIndexSingleQuestion(allStudentResponsesForAQuestion,answerKeyForThatQuestion) {
  Logger.log('INSIDE difficultyIndexSingleQuestion')

  const flattenedAllStudentResponseForAQuestion = [];

  for (const element of allStudentResponsesForAQuestion) {
    flattenedAllStudentResponseForAQuestion.push(element[0]);
  }

  //var flattenedAllStudentResponseForAQuestion = allStudentResponsesForAQuestion.map(element => element[0])

  let noOfCorrectResponses = 0;
  for (let i = 0; i < flattenedAllStudentResponseForAQuestion.length; i++) {
    if (flattenedAllStudentResponseForAQuestion[i] === answerKeyForThatQuestion) {
      noOfCorrectResponses++;
    }
  }

  Logger.log("noOfCorrectResponses" + noOfCorrectResponses)

  var noOfIncorrectResponses = flattenedAllStudentResponseForAQuestion.length - noOfCorrectResponses
  Logger.log("noOfIncorrectResponses")

  var difficultyIndexSingleQuestion = (noOfCorrectResponses * 100 / flattenedAllStudentResponseForAQuestion.length).toFixed(2)

  if (difficultyIndexSingleQuestion >= 85){
    var difficultyString = difficultyIndexSingleQuestion.toString() + "\n(E)"
  }
  if (difficultyIndexSingleQuestion >= 51 && difficultyIndexSingleQuestion < 85){
    var difficultyString = difficultyIndexSingleQuestion.toString() + "\n(M)"
  }
  if (difficultyIndexSingleQuestion < 51) {
    var difficultyString = difficultyIndexSingleQuestion.toString() + "\n(H)"
  }

  Logger.log(difficultyString)
  return difficultyString
}

function getAllStudentResponseForAQuestion(columnNumber){
  Logger.log('INSIDE getAllStudentResponseForAQuestion')
  var sheetId = getSheetId()
  var ss = SpreadsheetApp.openById(sheetId)
  var sheet = ss.getSheetByName('StudentResponses')
  var lastRow = sheet.getLastRow()

  var firstQuestionAllStudentResponseRange = sheet.getRange(1,columnNumber,lastRow,1)
  var firstQuestionAllStudentResponseValues = firstQuestionAllStudentResponseRange.getValues()

  Logger.log(firstQuestionAllStudentResponseValues)
  return firstQuestionAllStudentResponseValues
}

function difficultyIndexAllQuestions(){
  Logger.log("INSIDE difficultyIndexAllQuestions")

  // assumes that the scores are calculated and the marks array is sorted

  var sheetId = getSheetId()
  var ss = SpreadsheetApp.openById(sheetId)
  var sheet = ss.getSheetByName('StudentResponses')
  var lastRow = sheet.getLastRow()
  var lastCol = sheet.getLastColumn()

  var answerKey = getSheetData('AnswerKey')[0]

  var difficultyIndexArray = ['DifficultyIndex']
  var i = 0
  for (i=0;i<(lastCol-2);i++){
    var allStudentResponseForThisQuestion = getAllStudentResponseForAQuestion(i+2)
    var answerKeyForThisQuestion = answerKey[i]
    var difficultyIndex = difficultyIndexSingleQuestion(allStudentResponseForThisQuestion,answerKeyForThisQuestion)
    difficultyIndexArray.push(difficultyIndex)
  }
  Logger.log(difficultyIndexArray)
  return difficultyIndexArray
}

function discriminationIndexSingleQuestion(columnNumber){
  Logger.log('INSIDE discriminationIndex')

  // calculate H

  // get the responses of all high acheivers of  a single question
  var highAcheiverResponses = getResponsesForAGivenAcheiverSection("high",(columnNumber+1))
  // get the answer key of that corresponding question
  var answerKey = getSheetData('AnswerKey')[0][columnNumber-1]

  const flattenedAllStudentResponseForAQuestion_h = [];

  for (const element of highAcheiverResponses) {
    flattenedAllStudentResponseForAQuestion_h.push(element[0]);
  }

  Logger.log("flattenedAllStudentResponseForAQuestion_h")
  Logger.log(flattenedAllStudentResponseForAQuestion_h)

  // calculate the number of people who got correct answer in the high acheivers
  let noOfCorrectResponses_h = 0;
  for (let i = 0; i < flattenedAllStudentResponseForAQuestion_h.length; i++) {
    if (flattenedAllStudentResponseForAQuestion_h[i] === answerKey) {
      noOfCorrectResponses_h++;
    }
  }
  Logger.log(noOfCorrectResponses_h)

  // do that above for low acheivers
  var lowAcheiverResponses = getResponsesForAGivenAcheiverSection("low",(columnNumber+1))
  const flattenedAllStudentResponseForAQuestion_l = [];

  for (const element of lowAcheiverResponses) {
    flattenedAllStudentResponseForAQuestion_l.push(element[0]);
  }

  let noOfCorrectResponses_l = 0;
  for (let i = 0; i < flattenedAllStudentResponseForAQuestion_l.length; i++) {
    if (flattenedAllStudentResponseForAQuestion_l[i] === answerKey) {
      noOfCorrectResponses_l++;
    }
  }
  Logger.log("flattenedAllStudentResponseForAQuestion_l")
  Logger.log(flattenedAllStudentResponseForAQuestion_l)
  Logger.log(noOfCorrectResponses_l)

  var totalNoStudents = highAcheiverResponses.length + lowAcheiverResponses.length

  var discriminationIndex = (2*(noOfCorrectResponses_h - noOfCorrectResponses_l)/(totalNoStudents)).toFixed(2)

  if(discriminationIndex >= 0.35) {
    var discriminationString = discriminationIndex.toString() + "\n(G)"
  }
  if(discriminationIndex > 0.2 && discriminationIndex < 0.35){
    var discriminationString = discriminationIndex.toString() + "\n(I)"
  }
  if(discriminationIndex <= 0.2){
    var discriminationString = discriminationIndex.toString() + "\n(NA)"
  }

  Logger.log(discriminationString)
  return discriminationString

}

function discriminationIndexForAllQuestions(){
  Logger.log("INSIDE difficultyIndexAllQuestions")

  // assumes that the scores are calculated and the marks array is sorted

  var sheetId = getSheetId()
  var ss = SpreadsheetApp.openById(sheetId)
  var sheet = ss.getSheetByName('StudentResponses')
  var lastRow = sheet.getLastRow()
  var lastCol = sheet.getLastColumn()

  var answerKey = getSheetData('AnswerKey')[0]

  var discriminationIndexArray = ['DiscriminationIndex']
  var i=1
  for(i=1;i<(lastCol-1);i++){
    var discriminationIndexForQuesstion = discriminationIndexSingleQuestion(i)
    discriminationIndexArray.push(discriminationIndexForQuesstion)
  }
  Logger.log(discriminationIndexArray)
  Logger.log(discriminationIndexArray.length)
  return discriminationIndexArray
}

function getResponsesForAGivenAcheiverSection(acheiverType,columnNumber){
  Logger.log('INSIDE getResponsesForAGivenAcheiverSection')

  // assumes that the response sheet is sorted based on marks

  var allStudentsResponseForAquestion = getAllStudentResponseForAQuestion(columnNumber)
  var noOfStudents = allStudentsResponseForAquestion.length
  var halfMark = Math.ceil((noOfStudents/2))

  if(acheiverType == "high"){
    var responseForAcheiverType = allStudentsResponseForAquestion.slice(0,halfMark)
    
  }
  if(acheiverType == 'low'){
    var responseForAcheiverType = allStudentsResponseForAquestion.slice(halfMark)
  }
  Logger.log(responseForAcheiverType)
  return responseForAcheiverType

}

function highAcheivers(){
  Logger.log("INSIDE highAcheivers")

  //assumes that scores have been already been calculated
  sortByScore()
  
  var allStudentResponse = getSheetData('StudentResponses')

  var totalNoStudents = allStudentResponse.length
  var halfTheStudents = Math.ceil((totalNoStudents / 2))

  var highAcheivers = allStudentResponse.slice(0,halfTheStudents)

  Logger.log(highAcheivers)
  return highAcheivers

}

function lowAcheivers(){
  Logger.log("INSIDE lowAcheivers")

  //assumes that scores have been already been calculated
  sortByScore()
  
  var allStudentResponse = getSheetData('StudentResponses')

  var totalNoStudents = allStudentResponse.length
  var halfTheStudents = Math.ceil((totalNoStudents / 2))

  var lowAcheivers = allStudentResponse.slice(halfTheStudents)

  Logger.log(lowAcheivers)
  return lowAcheivers
}

function distractorEfficiencySingleQuestion(columnNumber){
  Logger.log('INSIDE distractorEfficiencySingleQuestion')

  // Assume that there are only 4 options in the MCQ type namely A, B, C, D
  var optionsArray = generateOptionsArray()
  

  // get the all lowAcheivers responses of the question

  var lowAcheiverResponseForAQuestion = getResponsesForAGivenAcheiverSection("low",columnNumber)
  var flattenLowAcheiverResponseForAQuestion = flattenStudentResponse(lowAcheiverResponseForAQuestion)


  // calculate the number of response per option
  var questionNumber = "Q " + (columnNumber-1).toString()
  var optionPercentageArray = [questionNumber]

  var i=0
  for(i=0;i<optionsArray.length;i++){
    var j = 0;
    var noOfStudentsChosenThisOption = 0
    var noOfLowAcheivers = flattenLowAcheiverResponseForAQuestion.length
    for(j=0;j<noOfLowAcheivers;j++){
      if(optionsArray[i] == flattenLowAcheiverResponseForAQuestion[j]){
        noOfStudentsChosenThisOption = noOfStudentsChosenThisOption + 1
      }
    }
    var lowAcheiverChosenPercentage = (noOfStudentsChosenThisOption*100/noOfLowAcheivers).toFixed(2)
    if (lowAcheiverChosenPercentage <= 5) {
      var chosenString = lowAcheiverChosenPercentage.toString() + "\n(CHANGE)"
    }
    else{
      var chosenString = lowAcheiverChosenPercentage.toString()
    }
    optionPercentageArray.push(chosenString)

    
  }
  
  Logger.log(optionPercentageArray)
  return optionPercentageArray

}

function distractorEfficiencyAllQuestions(){
  Logger.log("INSIDE distractorEfficiencyAllQuestions")

  // assumes that the scores are calculated and the marks array is sorted

  var sheetId = getSheetId()
  var ss = SpreadsheetApp.openById(sheetId)
  var sheet = ss.getSheetByName('StudentResponses')
  var lastRow = sheet.getLastRow()
  var lastCol = sheet.getLastColumn()

  var firstQuestionColumn = 2
  var lastQustionColumn = lastCol -1

  var distractorEfficiencyAllQuestionsArray = []

  var i = firstQuestionColumn;
  for(i=firstQuestionColumn;i<lastCol;i++){
    //distractorEfficiencyAllQuestionsArray.push("Q " + i.toString())
    var distractorEfficiencySingleQuestionArray = distractorEfficiencySingleQuestion(i)
    distractorEfficiencyAllQuestionsArray.push(distractorEfficiencySingleQuestionArray)
  }
  Logger.log(distractorEfficiencyAllQuestionsArray)
  Logger.log(distractorEfficiencyAllQuestionsArray.length)
  return distractorEfficiencyAllQuestionsArray
}

function flattenStudentResponse(singleStudentResponse){
  const flattenedAllStudentResponseForAQuestion = [];

  for (const element of singleStudentResponse) {
    flattenedAllStudentResponseForAQuestion.push(element[0]);
  }

  Logger.log(flattenedAllStudentResponseForAQuestion)
  return flattenedAllStudentResponseForAQuestion
}

function generateOptionsArray(){
  var scriptProperties = PropertiesService.getScriptProperties()
  var noOfOptions = scriptProperties.getProperty("noOfOptions")

  var optionsArray = []

  var i=0;
  for(i=0;i<noOfOptions;i++){
    optionsArray.push(String.fromCharCode(65 + i))
  }

  Logger.log(optionsArray)
  return optionsArray
}

function generateMCQItemAnalysisDocument(){
  Logger.log("INSIDE generateMCQItemAnalysisDocument")

  // Assess if the student responses sheet has got the scores calculated
  // This is simply done by assessing if the number of columns in the "StudentsResponse" sheet and the "AnswerKey" sheet differ by 1
  // Let the number of questions be n
  // so the number of columns in "AnswerKey" sheet is n
  // if the the scores are ALREADY CACLUATED then the number of columns in "StudentsResponse" sheet will be "n+2" because there is a column for
  // roll number and a column for scores
  // if the scores are NOT YET CALCULATED then the number of columns in "StudentsResponse" sheet will be "n+1" 

  var dataFromStudentsResponseSheet = getSheetData('StudentResponses')
  var dataFromAnswerKeySheet = getSheetData('AnswerKey')

  var noOfColumnsInStudentsResponse = dataFromStudentsResponseSheet[0].length
  var noOfColumnsInAnswerKeySheet = dataFromAnswerKeySheet[0].length

  var columnDifferenceBetStudentResponseAndAnswerKey =  noOfColumnsInStudentsResponse - noOfColumnsInAnswerKeySheet

  if (columnDifferenceBetStudentResponseAndAnswerKey == 1){
    // if the scores are not yet calculated
    calculateScoreForAll()
    sortByScore()
  }
  if (columnDifferenceBetStudentResponseAndAnswerKey == 2){
    // if the scores are already calculated
    // just to be on the safer side sort it by scores
    sortByScore()

  }

  var scriptProperties = PropertiesService.getScriptProperties()
  var mcqAnalysisFolderId = scriptProperties.getProperty("mcqAnalysisFolder")

  Logger.log(mcqAnalysisFolderId)
  var noOfQuestions = (getSheetData('AnswerKey')[0]).length
  Logger.log(noOfQuestions)

  var questionNumberArray = ["Question"]
  var i=0;
  for(i=0;i<noOfQuestions;i++){
    (questionNumberArray.push((i+1).toFixed(0)))
  }
  Logger.log(questionNumberArray)

  var doc = DocumentApp.create("MCQ_item_analysis")
 
  var docId = doc.getId()
  var file = DriveApp.getFileById(docId)

  var mcqFolder = DriveApp.getFolderById(mcqAnalysisFolderId)

  file.moveTo(mcqFolder)

  var body = doc.getBody()
  body.setPageHeight(595)
  body.setPageWidth(1200)

  

  var difficultyIndexAllQuestionsArray = difficultyIndexAllQuestions()

  var table1Cells = [
    questionNumberArray,
    difficultyIndexAllQuestionsArray
  ]

  Logger.log(table1Cells)

  var table1 = body.appendTable(table1Cells)

  var discriminationIndexForAllQuestionsArray = discriminationIndexForAllQuestions()

  var table2Cells = [
    questionNumberArray,
    discriminationIndexForAllQuestionsArray
  ]

  var table2 = body.appendTable(table2Cells)

  var optionsArray = [" "]
  var options = (generateOptionsArray())
  var newOptionsArray = [...optionsArray, ...options]
  var distractorEfficiencyAllQuestionsArray = distractorEfficiencyAllQuestions()

  var optionsArray = [" "]
  var generatedOptionsArray = generateOptionsArray()
  var newOptionsArray = [[...optionsArray,...generatedOptionsArray]]

  
  var table3Cells = [...newOptionsArray, ...distractorEfficiencyAllQuestionsArray]

  Logger.log(table3Cells)

  body.appendParagraph("DISTRACTOR EFFICIENCY")
  body.appendTable(table3Cells)
  
  doc.saveAndClose()

}
