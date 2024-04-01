function test_getSheetId() {
  getSheetId()
}

function test_getSheetData(){
  var dataFromStudentsResponseSheet = getSheetData('StudentResponses')
  var dataFromAnswerKeySheet = getSheetData('AnswerKey')

  Logger.log(dataFromStudentsResponseSheet[0].length)
  Logger.log(dataFromAnswerKeySheet[0].length)

}

function test_calculateScore(){
  var firstStudentResponse = getSheetData('StudentResponses')[0]
  var answerKey = getSheetData('AnswerKey')[0]

  Logger.log(firstStudentResponse)
  calculateScore(firstStudentResponse, answerKey)
}

function test_calculateScoreForAll() {
  calculateScoreForAll()
}

function test_sortByScore() {
  sortByScore()
}

function test_difficultyIndexSingleQuestion() {
  var sheetId = getSheetId()
  var ss = SpreadsheetApp.openById(sheetId)
  var sheet = ss.getSheetByName('StudentResponses')
  var lastRow = sheet.getLastRow()

  var firstQuestionAllStudentResponseRange = sheet.getRange(1,2,lastRow,1)
  var firstQuestionAllStudentResponseValues = firstQuestionAllStudentResponseRange.getValues()
  Logger.log("firstQuestionAllStudentResponseValues")
  Logger.log(firstQuestionAllStudentResponseValues)

  var answerKeyFirstQuestion = getSheetData('AnswerKey')[0][0]

  difficultyIndexSingleQuestion(firstQuestionAllStudentResponseValues,answerKeyFirstQuestion)

}

function test_getAllStudentResponseForAQuestion() {
  getAllStudentResponseForAQuestion(2)
}

function test_difficultyIndexAllQuestions(){
  difficultyIndexAllQuestions()
}

function test_splitStudentResponseIntoHighAchieverAndLowAchiever(){
  splitStudentResponseIntoHighAchieverAndLowAchiever()
}

function test_discriminationIndexSingleQuestion(){
  discriminationIndexSingleQuestion(20)
}

function test_discriminationIndexForAllQuestions() {
  discriminationIndexForAllQuestions()
}

function test_getResponsesForAGivenAcheiverSection(){
  getResponsesForAGivenAcheiverSection("high",2)
}

function test_highAcheivers(){
  highAcheivers()
}

function test_lowAcheivers(){
  lowAcheivers()
}

function test_distractorEfficiencySingleQuestion(){
  distractorEfficiencySingleQuestion(2)
}

function test_distractorEfficiencyAllQuestions(){
  distractorEfficiencyAllQuestions()
}

function test_flattenStudentResponse(){
  var lowAcheiverResponses = getResponsesForAGivenAcheiverSection("low",(2))
  flattenStudentResponse(lowAcheiverResponses)
}

function test_generateOptionsArray(){

  generateOptionsArray()
}

function test_generateMCQItemAnalysisDocument(){
  generateMCQItemAnalysisDocument()
}

function test_getFolderById(){


  var scriptProperties = PropertiesService.getUserProperties()
  
  var mcqAnalysisFolderId = scriptProperties.getProperty("mcqAnalysisFolder")

  Logger.log(mcqAnalysisFolderId)

  var mcqFolder = DriveApp.getFolderById(mcqAnalysisFolderId)
}

function test_ceil() {
  Logger.log(Math.ceil(2.5))
}

function test_arrayAddition(){
  var a = [" "]
  var b = [1,2,3,4]
  var c = [...a,...b]
  Logger.log(c)
}
