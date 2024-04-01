# MCQ_Validation_Item_Analysis
An automated google app script based validation of the Multiple choice questions (item analysis) based on difficulty index, Discrimination Index and Distractor efficiency
The item analysis of multiple choice questions (MCQs) is an essential tool that can provide input on validity and reliability of items. It helps to identify items which can be revised or discarded, thus building a quality MCQ bank (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7873707/)



# Description the files
1. The sheet "StudentResponses" in the file "MCQ_Assessment.xlsx" contains the responses of 21 students. Each row describes contains the data about a single student. Column A is the roll number of the student. Columns B to U contain the student's responses to the MCQ question. (Here there are 20 MCQ questions). Column V shows the mark obtained by the student and it will be calculated by the program. The sheet "AnswerKey" contains the answer key to the MCQ questions. Column A is question 1 and Column T is question 20.
2. The file "Sample_MCQ_item_analysis.docx" is the item analysis report that was produced by this script.
3. The file "Code.gs" contains the actual google app script code that generates the item analysis report
4. The file "test.gs" contains the test code for the functions in the file "Code.gs"
5. The file "script_properties" contains the properties that were described as script properties in the google apps script editior.

# How to use this
1. The script requires the sheetId of the google sheet which contains the student MCQ responses, Answer key and the location where the item analysis report needs to be saved in the google drive. (to be given in the script properties)
2. Run the function "generateMCQItemAnalysisDocument" in the "Code.gs" file.
3. This shall generate a Item analysis report as specified in the script properties.
