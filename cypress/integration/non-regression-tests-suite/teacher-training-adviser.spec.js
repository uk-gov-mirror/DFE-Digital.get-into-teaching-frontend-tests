import TeacherTrainingAdviser from "../../support/pageobjects/TeacherTrainingAdviser";
import Navlinks from "../../support/pageobjects/Navlinks";
import MailingListSignUp from "../../support/pageobjects/MailinglistSignupPage";
/// <reference types="Cypress" />
let firstName;
let lastName;
function terminalLog(violations) {
	cy.task(
		"log",
		`${violations.length} accessibility violation${violations.length === 1 ? "" : "s"} ${
			violations.length === 1 ? "was" : "were"
		} detected`
	);
	const violationData = violations.map(({ id, impact, description, nodes }) => ({
		id,
		impact,
		description,
		nodes: nodes.length,
	}));
	cy.task("table", violationData);
}

describe("Feature - Get an adviser : Tests execution date and time : " + new Date(), () => {
	const teacherTrainingAdviser = new TeacherTrainingAdviser();
	beforeEach(function () {
		//cy.viewport("samsung-s10");
		cy.fixture("tta-signup-test-data.json").then((ttaTestData) => {
			this.ttaTestData = ttaTestData;
		});
		cy.fixture("mailinglist-signup-test-data.json").then((mailingListTestData) => {
			this.mailingListTestData = mailingListTestData;
		});

		cy.visit(Cypress.env("baseurl_tta_flow"), {
			auth: {
				username: Cypress.env("HTTPAUTH_USERNAME"),
				password: Cypress.env("HTTPAUTH_PASSWORD"),
			},
		});
		cy.acceptAllCookies();
		cy.clickOnStartNowButton();
		cy.injectAxe();
	});
	it("Has no detectable a11y violations on load", function () {
		// Test the page at initial load
		cy.checkA11y();
	});

	it("Has no detectable a11y violations on load (filtering to only include critical impact violations)", function () {
		// Test on initial load, only report and assert for critical impact items
		cy.checkA11y(null, {
			includedImpacts: ["critical"],
		});
	});

	it("Logs violations to the terminal", function () {
		cy.checkA11y(null, null, terminalLog);
	});

	it("It shows the error message if user clicks continiue button without selecting subject", function () {
		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("Yes");
		cy.havePreviousTeacherReferenceNumber(true);
		cy.enterPreviousTeacherReferenceNumber(23478463);
		cy.selectPreviuosMainSubject("Computing");
		cy.clickOnContinueButton();
		cy.verifyErrorSummaryTitle().next().should("have.text", "Choose a subject or other");
	});
	it('It shows "Thank you  Sign up complete" to non-returner overseas user, interesed in primary stage teaching, have grade 4 (C) or above in english, maths and science GCSE', function () {
		/*Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? -Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - Yes
		  Overseas user
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Brazil");
		cy.enterOverseasTelephoneNumber(this.ttaTestData.phoneNumber);
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, interesed in primary stage teaching, have grade 4 (C) or above in English and maths GCSE not in science GCSE but planning to retake science GCSE', function () {
		/*Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? -Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  UK user
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Get the right GCSEs or equivalent qualifications message" to non-returner user, interesed in primary stage teaching, have grade 4 (C) or above in English and maths and not in science GCSE  nor planning to retake', function () {
		/*Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? -Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - No
		  Expected page - Get the right GCSEs or equivalent qualifications
		 
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(false);
		cy.verifyGetRightGCSEMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, interesed in primary stage teaching, have no grade 4 (C) or above in English and maths GCSEs but planning to retake, have grade 4 (C) or above in GCSE science', function () {
		/*Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - Yes
		  UK user
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, interesed in primary stage teaching, have no grade 4 (C) or above in English and maths GCSEs but planning to retake, have grade 4 (C) or above in GCSE science', function () {
		/*Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - Yes
		  Overseas user
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Cuba");
		cy.enterOverseasTelephoneNumber("38484102834");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, interesed in primary stage teaching,have no grade 4 (C) or above in English and maths GCSEs but planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  UK user
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, interesed in primary stage teaching,have no grade 4 (C) or above in English and maths GCSEs but planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  Overseas user
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Cuba");
		cy.enterOverseasTelephoneNumber("839494102834");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Get the right GCSEs or equivalent qualifications message" to non-returner user, interesed in primary stage teaching,have no grade 4 (C) or above in English and maths GCSEs nor planning to retake, have no grade 4 (C) or above in GCSE science nor planning to retake', function () {
		/*Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - No 
		  Expected - Get the right GCSEs or equivalent qualifications page
		 
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(false);
		cy.verifyGetRightGCSEMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, interesed in teaching secondary stage ,have grade 4 (C) or above in English and maths GCSEs', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - Yes
		  UK user		 
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("Computing");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, interesed in teaching secondary stage, have grade 4 (C) or above in English and maths GCSEs', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - Yes
		  Overseas user		 
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("Computing");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Cyprus");
		cy.enterOverseasTelephoneNumber("36347485102834");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, interesed in teaching secondary stage, have no grade 4 (C) or above in English and maths GCSEs but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  UK user		 
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("Dance");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, interesed in teaching secondary stage, have no grade 4 (C) or above in English and maths GCSEs but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Overseas user		 
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("Dance");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Cyprus");
		cy.enterOverseasTelephoneNumber("1028343784");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Get the right GCSEs or equivalent qualifications" to non-returner user, interesed in teaching secondary stage, have no grade 4 (C) or above in English and maths GCSEs nor planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - Yes
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - No
		  Expected - Get the right GCSEs or equivalent qualifications page	 
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Dance");
		cy.selectWhichClassIsYourDegree("2:2");
		cy.wait(1000);
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(false);
		cy.verifyGetRightGCSEMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree, interesed in teaching primary stage, have grade 4 (C) or above in English, maths and science GCSEs', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? -Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - Yes
		  UK user
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree, interesed in teaching primary stage, have grade 4 (C) or above in English, maths and science GCSEs', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? -Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - Yes
		  Overseas use
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Denmark");
		cy.enterOverseasTelephoneNumber("02637485859");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree, interesed in teaching primary stage, have grade 4 (C) or above in English and maths GCSEs, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? -Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  UK user
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree, interesed in teaching primary stage, have grade 4 (C) or above in English and maths GCSEs, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? -Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  Overseas user
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("India");
		cy.enterOverseasTelephoneNumber("+91-9663717251");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Get the right GCSEs or equivalent qualifications" to non-returner, studying for a degree, interesed in teaching primary stage, have grade 4 (C) or above in English and maths GCSEs, have no grade 4 (C) or above in GCSE science nor planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? -Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - No
		  //Expected page - Get the right GCSEs or equivalent qualifications	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(false);
		cy.verifyGetRightGCSEMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have grade 4 (C) or above in GCSE science', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		 Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - Yes
		  UK user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have grade 4 (C) or above in GCSE science', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		 Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - Yes
		  Overseas user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Estonia");
		cy.enterOverseasTelephoneNumber(this.ttaTestData.phoneNumber);
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree- Final year, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  UK user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree- Second year, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  UK user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Second year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree- First year, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  UK user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("First year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree- Other, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  UK user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Other");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree - Final year, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  Overseas user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Chile");
		cy.enterOverseasTelephoneNumber(this.ttaTestData.phoneNumber);
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree - Second year, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  Overseas user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Second year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Chile");
		cy.enterOverseasTelephoneNumber(this.ttaTestData.phoneNumber);
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree - First year, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  Overseas user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("First year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Chile");
		cy.enterOverseasTelephoneNumber(this.ttaTestData.phoneNumber);
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree - Other, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - Yes
		  Overseas user	  
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Other");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Chile");
		cy.enterOverseasTelephoneNumber(this.ttaTestData.phoneNumber);
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Get the right GCSEs or equivalent qualifications" to non-returner user, studying for a degree, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs and planning to retake, have no grade 4 (C) or above in GCSE science nor planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Do you have grade 4 (C) or above in GCSE science, or equivalent? - No
		  Are you planning to retake your science GCSE? - No
		  Expected - Get the right GCSEs or equivalent qualifications page		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.gcseScience(false);
		cy.retakeGcseScience(false);
		cy.verifyGetRightGCSEMessage();
	});

	it('It shows "Get the right GCSEs or equivalent qualifications" to non-returner user, studying for a degree, interesed in teaching primary stage, have no grade 4 (C) or above in English and maths GCSEs nor planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - primary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - No
		  Expected - Get the right GCSEs or equivalent qualifications		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(false);
		cy.verifyGetRightGCSEMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree, interesed in teaching secondary stage, have grade 4 (C) or above in English and maths GCSEs', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - Yes
		  UK user
		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("Computing");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk("UK");
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree, interesed in teaching secondary stage, have grade 4 (C) or above in English and maths GCSEs', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - Yes
		  Overseas user		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("Computing");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Cyprus");
		cy.enterOverseasTelephoneNumber("47485102834");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, studying for a degree, interesed in teaching secondary stage, have no grade 4 (C) or above in English and maths GCSEs but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  UK user		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("Dance");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk("UK");
		cy.enterUKCandidateAddress("21", "Victoria Embankment", "Darlington", "DL1 5JR");
		cy.enterUKTelephoneNumber("0125234490");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, studying for a degree, interesed in teaching secondary stage, have no grade 4 (C) or above in English and maths GCSEs but planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - Yes
		  Overseas user		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("Dance");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("31", "03", "1985");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Cyprus");
		cy.enterOverseasTelephoneNumber(this.ttaTestData.phoneNumber);
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Get the right GCSEs or equivalent qualifications" to non-returner user, studying for a degree, interesed in teaching secondary stage, have no grade 4 (C) or above in English and maths GCSEs nor planning to retake', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I'm studying for a degree
		  Which stage are you interested in teaching? - secondary
		  Do you have grade 4 (C) or above in English and maths GCSEs, or equivalent? - No
		  Are you planning to retake either English or maths (or both) GCSEs, or equivalent? - No
		  Expected - Get the right GCSEs or equivalent qualifications page		 	   
		*/
		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(false);
		cy.verifyGetRightGCSEMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner UK user, have an equivalent qualification from another country, interested in teaching secondary stage ', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I have an equivalent qualification from another country
		  Which stage are you interested in teaching? - secondary
		  UK user		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I have an equivalent qualification from another country");
		cy.selectStage("Secondary");
		cy.whichSubjectAreYouInterestedInTeaching("Computing");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("27", "07", "1983");
		cy.get("#teacher-training-adviser-steps-uk-or-overseas-uk-or-overseas-uk-field").click();
		cy.clickOnContinueButton();
		cy.enterUKCandidateAddress("25", "Delbury Court", "Telford", "TF3 2BP");
		cy.get("#teacher-training-adviser-steps-uk-callback-telephone-field").type("0123454748");
		/*cy.get(".govuk-heading-l")
			.should("exist")
			.should("have.text", "You told us you live in the United Kingdom");
		cy.clickOnContinueButton();*/
		cy.clickOnContinueButton();

		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overeas user, have an equivalent qualification from another country, interested in teaching secondary stage ', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I have an equivalent qualification from another country
		  Which stage are you interested in teaching? - secondary
		  Overseas user		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I have an equivalent qualification from another country");
		cy.selectStage("Secondary");
		cy.whichSubjectAreYouInterestedInTeaching("Computing");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("27", "07", "1983");
		cy.clickOnContinueButton();
		cy.get("#teacher-training-adviser-steps-uk-or-overseas-uk-or-overseas-overseas-field").click();
		cy.clickOnContinueButton();
		cy.get("#teacher-training-adviser-steps-overseas-country-country-id-field").select("Austria");
		cy.clickOnContinueButton();
		cy.contains("Contact telephone number").type("0125234490");
		cy.clickOnContinueButton();
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});
	it('It shows "Thank you  Sign up complete" to non-returner UK user, have an equivalent qualification from another country interested in teaching primary stage', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I have an equivalent qualification from another country
		  Which stage are you interested in teaching? - primary
		  UK user		 	   
		*/

		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I have an equivalent qualification from another country");
		cy.selectStage("Primary");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("22", "08", "2000");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("25", "Delbury Court", "Telford", "TF3 2BT");
		cy.get("#teacher-training-adviser-steps-uk-callback-telephone-field").type("0123454748");
		cy.clickOnContinueButton();
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it('It shows "Thank you  Sign up complete" to non-returner overseas user, have an equivalent qualification from another country interested in teaching primary stage', function () {
		/*
		  Are you returning to teaching? - No
		  Do you have a degree? - I have an equivalent qualification from another country
		  Which stage are you interested in teaching? - primary
		  Overseas user		 	   
		*/
		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I have an equivalent qualification from another country");
		cy.selectStage("Primary");
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth("22", "08", "2000");
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Austria");
		cy.contains("Contact telephone number").type("0125234490");
		cy.clickOnContinueButton();
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});

	it("It should retain the candidate details if he navigates back  ", function () {
		let rnum = Math.floor(Math.random() * 10000000 + 1);
		firstName = "First_" + rnum + "_name";
		lastName = "Last_" + rnum + "_name";
		let name = firstName + ":" + lastName;
		cy.writeFile("cypress/fixtures/user.txt", name);
		teacherTrainingAdviser.getFirstName().type(firstName);
		teacherTrainingAdviser.getLastName().type(lastName);
		teacherTrainingAdviser.getEmailAddress().type(this.ttaTestData.email);
		teacherTrainingAdviser.getContinueButton().click();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Biology");
		cy.selectWhichClassIsYourDegree("First class");
		cy.selectStage("Primary");
		cy.gcseMathsAndEnglish(true);
		cy.gcseScience(true);
		cy.whenDoYouWantToStartYourTeacherTraining("2021");
		cy.enterDateOfBirth(31, 3, 1985);
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Denmark");
		cy.enterOverseasTelephoneNumber(this.ttaTestData.phoneNumber);
		cy.verifyCheckYourAnswersMessage();
		cy.contains("Name")
			.next()
			.contains(firstName + " " + lastName);
		cy.contains("Date of birth").next().contains("31 03 1985");
		cy.contains("Email").next().contains(this.ttaTestData.email);
		cy.contains("Telephone").next().contains("01234567890");
		cy.contains("Are you returning to teaching?").next().contains("No");
		cy.contains("Do you have a degree?").next().contains("Yes");
		cy.contains("Which subject is your degree?").next().contains("Biology");
		cy.contains("Which class is your degree?").next().contains("First class");
		cy.contains("Which stage are you interested in teaching?").next().contains("Primary");
		cy.contains("Do you have grade 4 (C) or above in maths and English GCSE, or equivalent?").next().contains("Yes");
		cy.contains("Do you have science GCSE Grade 4 or above?").next().contains("Yes");
		cy.contains("When do you want to start teacher training?").next().contains("2021");
		cy.contains("Where do you live?").next().contains("Overseas");
		cy.contains("Which country do you live in?").next().contains("Denmark");
		cy.clickOnBackButton();
		cy.get("#teacher-training-adviser-steps-overseas-telephone-telephone-field").should("have.value", "01234567890");
		cy.wait(100);
		cy.clickOnBackButton();
		cy.wait(300);
		cy.clickOnBackButton();
		cy.wait(500);
		cy.contains("Overseas")
			.invoke("attr", "for")
			.then(function (val) {
				let id = "#" + val;
				cy.get(id).should("be.checked");
			});
		cy.clickOnBackButton();
		cy.contains("Day")
			.invoke("attr", "for")
			.then(function (val) {
				let id = "#" + val;
				cy.get(id).should("have.value", "31");
			});
		cy.contains("Month")
			.invoke("attr", "for")
			.then(function (val) {
				let id = "#" + val;
				cy.get(id).should("have.value", "3");
			});
		cy.contains("Year")
			.invoke("attr", "for")
			.then(function (val) {
				let id = "#" + val;
				cy.get(id).should("have.value", "1985");
			});
		cy.clickOnContinueButton();
		cy.clickOnContinueButton();
		cy.clickOnContinueButton();
		cy.clickOnContinueButton();
		cy.clickOnContinueButton();
		cy.acceptPolicy();
		cy.verifySignUpCompleteMessage();
	});
	it('It shows " You have already signed up to this service" message to previously signed up user', function () {
		teacherTrainingAdviser.getFirstName().type(firstName);
		teacherTrainingAdviser.getLastName().type(lastName);
		teacherTrainingAdviser.getEmailAddress().type(this.ttaTestData.email);
		teacherTrainingAdviser.getContinueButton().click();
		cy.enterEmailVerificationCode(this.ttaTestData.email, Cypress.env("TTA_USER_EMAIL_API_KEY"));
		teacherTrainingAdviser.getContinueButton().click();
		cy.get(".govuk-heading-l").should("exist").should("have.text", "You have already signed up to this service");
	});

	it("It shows the error message if user clicks continiue button without entering the mandatory or correct details", function () {
		teacherTrainingAdviser.getFirstName();
		teacherTrainingAdviser.getLastName();
		teacherTrainingAdviser.getEmailAddress();
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.get(".govuk-error-summary__list").children().should("exist").next().should("exist").next().should("exist");
		cy.get(".govuk-list.govuk-error-summary__list > li:nth-child(1)")
			.should("have.text", "You need to enter your first name")
			.next()
			.should("have.text", "You need to enter your last name")
			.next()
			.should("have.text", "You need to enter your email address");

		let rnum = Math.floor(Math.random() * 10000000 + 1);
		let firstName = "First_" + rnum + "_name";
		let lastName = "Last_" + rnum + "_name";
		cy.get("#teacher-training-adviser-steps-identity-first-name-field-error").type(firstName);
		cy.get("#teacher-training-adviser-steps-identity-last-name-field-error").type(lastName);
		cy.get("#teacher-training-adviser-steps-identity-email-field-error").type(this.ttaTestData.email);
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("Select yes if you are returning to teaching");
		cy.get("#teacher-training-adviser-steps-returning-teacher-type-id-error").should(
			"have.text",
			"Error: Select yes if you are returning to teaching"
		);
		cy.get("#teacher-training-adviser-steps-returning-teacher-type-id-222750000-field").click();

		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("Select an option from the list");
		cy.get("#teacher-training-adviser-steps-have-a-degree-degree-options-error").should(
			"have.text",
			"Error: Select an option from the list"
		);
		cy.get("#teacher-training-adviser-steps-have-a-degree-degree-options-field-error").click();
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.selectWhichClassIsYourDegree("First class");
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("You must select either primary or secondary");
		cy.get("#teacher-training-adviser-steps-stage-interested-teaching-preferred-education-phase-id-error").should(
			"have.text",
			"Error: You must select either primary or secondary"
		);
		cy.get("#teacher-training-adviser-steps-stage-interested-teaching-preferred-education-phase-id-222750001-field").click();
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("Select yes if you have grade 4(C) or above in English and Maths GCSE or equivalent");
		cy.get("#teacher-training-adviser-steps-gcse-maths-english-has-gcse-maths-and-english-id-error").should(
			"have.text",
			"Error: Select yes if you have grade 4(C) or above in English and Maths GCSE or equivalent"
		);
		cy.get("#teacher-training-adviser-steps-gcse-maths-english-has-gcse-maths-and-english-id-field-error").click();
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.enterDateOfBirth("31", "03", "1985");
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("Select if you live in the UK or overseas");
		cy.get("#teacher-training-adviser-steps-uk-or-overseas-uk-or-overseas-error").should(
			"have.text",
			"Error: Select if you live in the UK or overseas"
		);
		cy.get("#teacher-training-adviser-steps-uk-or-overseas-uk-or-overseas-field-error").click();
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.get(".govuk-error-summary__list").children().should("exist").next().should("exist").next().should("exist");
		cy.get(".govuk-list.govuk-error-summary__list > li:nth-child(1)")
			.should("have.text", "Enter the first line of your address")
			.next()
			.should("have.text", "Enter your town or city")
			.next()
			.should("have.text", "Enter a real postcode");
		cy.get("#teacher-training-adviser-steps-uk-address-address-line1-field-error").type(this.ttaTestData.address_Line1);
		cy.get("#teacher-training-adviser-steps-uk-address-address-city-field-error").type(this.ttaTestData.city);
		cy.get("#teacher-training-adviser-steps-uk-address-address-postcode-field-error").type(this.ttaTestData.postcode);
		teacherTrainingAdviser.getContinueButton().click();
		cy.get("#teacher-training-adviser-steps-uk-telephone-telephone-field").type(this.ttaTestData.phoneNumber);
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.clickOnCompleteButton();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("You must accept the privacy policy in order to talk to a teacher training adviser");
		cy.get("#teacher-training-adviser-steps-accept-privacy-policy-accepted-policy-id-error").should(
			"have.text",
			"Error: You must accept the privacy policy in order to talk to a teacher training adviser"
		);
		cy.acceptPolicy();
	});
	it("It shows Privacy policy details to the user if he clicks on link", function () {
		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("Yes");
		cy.havePreviousTeacherReferenceNumber(true);
		cy.enterPreviousTeacherReferenceNumber(23478463);
		cy.selectPreviuosMainSubject("Computing");
		cy.selectSubjectLikeToTeach("Physics");
		cy.enterDateOfBirth("25", "02", "1986");
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("55", "Hollinswood", "Telford", "TF3 2BT");
		cy.enterUKTelephoneNumber("012345678");
		cy.verifyCheckYourAnswersMessage();
		cy.clickOnContinueButton();
		cy.get(".govuk-form-group > a").click();
		cy.get("h2").should("exist").should("have.text", "Privacy Policy");
		cy.get(":nth-child(3) > strong").should("exist").should("have.text", "Legal information");
		cy.get(".govuk-footer__meta").should("exist");
	});
	it("It allows user to change his details ( say - date of birth ) on answers page and also system should preserve previously entered data", function () {
		teacherTrainingAdviser.getFirstName().type("Sushant");
		teacherTrainingAdviser.getLastName().type("Kumar");
		teacherTrainingAdviser.getEmailAddress().type("sushantkumar@gamil.com");
		teacherTrainingAdviser.getContinueButton().click();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Biology");
		cy.selectWhichClassIsYourDegree("First class");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("English");
		cy.whenDoYouWantToStartYourTeacherTraining("2022");
		cy.enterDateOfBirth(31, 3, 1985);
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Cyprus");
		cy.enterOverseasTelephoneNumber("102834");
		cy.verifyCheckYourAnswersMessage();
		cy.contains("Date of birth").next().next().click();
		cy.contains("Day")
			.invoke("attr", "for")
			.then(function (val) {
				let id = "#" + val;
				cy.get(id).should("have.value", "31");
			});
		cy.contains("Month")
			.invoke("attr", "for")
			.then(function (val) {
				let id = "#" + val;
				cy.get(id).should("have.value", "3");
			});
		cy.contains("Year")
			.invoke("attr", "for")
			.then(function (val) {
				let id = "#" + val;
				cy.get(id).should("have.value", "1985");
			});
		cy.contains("Year").next().clear();
		cy.contains("Year").next().type("1987");
		teacherTrainingAdviser.getContinueButton().click();
		cy.contains("Overseas")
			.invoke("attr", "for")
			.then(function (val) {
				let id = "#" + val;
				cy.get(id).should("be.checked");
			});
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		teacherTrainingAdviser.getContinueButton().click();
		cy.contains("Name").next().contains("Sushant Kumar");
		cy.contains("Date of birth").next().contains("31 03 1987");
		cy.contains("Telephone").next().contains("102834");
		cy.contains("Are you returning to teaching?").next().contains("No");
		cy.contains("Do you have a degree?").next().contains("Yes");
		cy.contains("Which subject is your degree?").next().contains("Biology");
		cy.contains("Which class is your degree?").next().contains("First class");
		cy.contains("Which stage are you interested in teaching?").next().contains("Secondary");
		cy.contains("Do you have grade 4 (C) or above in maths and English GCSE, or equivalent?").next().contains("No");
		cy.contains("Are you planning to retake your English or maths GCSEs?").next().contains("Yes");
		cy.contains("When do you want to start teacher training?").next().contains("2022");
		cy.contains("Where do you live?").next().contains("Overseas");
		cy.contains("Which country do you live in?").next().contains("Cyprus");
	});
	it("It shows error message to user if he enters invalid telephone number - UK user", function () {
		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Biology");
		cy.selectWhichClassIsYourDegree("First class");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("English");
		cy.whenDoYouWantToStartYourTeacherTraining("2022");
		cy.enterDateOfBirth(31, 3, 1985);
		cy.doYouLiveInTheUk(true);
		cy.enterUKCandidateAddress("55", "Hollinswood", "Telford", "TF3 2BT");
		cy.enterUKTelephoneNumber("0834");
		cy.verifyErrorSummaryTitle();
		cy.get("#teacher-training-adviser-steps-uk-telephone-telephone-error")
			.should("exist")
			.should("have.text", "Error: Telephone number is too short (minimum is 5 characters)");
		cy.get("#teacher-training-adviser-steps-uk-telephone-telephone-field-error").clear();
		cy.get("#teacher-training-adviser-steps-uk-telephone-telephone-field-error").type("0123456789011223344566");
		cy.clickOnContinueButton();
		cy.verifyErrorSummaryTitle();
		cy.get("#teacher-training-adviser-steps-uk-telephone-telephone-error")
			.should("exist")
			.should("have.text", "Error: Telephone number is too long (maximum is 20 characters)");
	});

	it("It shows error message to user if he enters invalid telephone number - overseas user", function () {
		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Biology");
		cy.selectWhichClassIsYourDegree("First class");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("English");
		cy.whenDoYouWantToStartYourTeacherTraining("2022");
		cy.enterDateOfBirth(31, 3, 1985);
		cy.doYouLiveInTheUk(false);
		cy.whichCountryDoYouLiveIn("Cyprus");
		cy.enterOverseasTelephoneNumber("0495");
		cy.verifyErrorSummaryTitle();
		cy.get("#teacher-training-adviser-steps-overseas-telephone-telephone-error")
			.should("exist")
			.should("have.text", "Error: Telephone number is too short (minimum is 5 characters)");
		cy.get("#teacher-training-adviser-steps-overseas-telephone-telephone-field-error").clear();
		cy.get("#teacher-training-adviser-steps-overseas-telephone-telephone-field-error").type("0123456789011223344566");
		cy.clickOnContinueButton();
		cy.verifyErrorSummaryTitle();
		cy.get("#teacher-training-adviser-steps-overseas-telephone-telephone-error")
			.should("exist")
			.should("have.text", "Error: Telephone number is too long (maximum is 20 characters)");
	});

	it("Error message link navigates to its respective field", function () {
		cy.clickOnContinueButton();
		cy.get(".govuk-list.govuk-error-summary__list > li:nth-child(1)")
			.should("have.text", "You need to enter your first name")
			.next()
			.should("have.text", "You need to enter your last name")
			.next()
			.should("have.text", "You need to enter your email address");

		cy.contains("You need to enter your first name")
			.should((el) => {
				expect(el).to.have.attr("href", "#teacher-training-adviser-steps-identity-first-name-field-error");
			})
			.click()
			.type("Test_First_Name");
		cy.clickOnContinueButton();
		cy.get(".govuk-list.govuk-error-summary__list > li:nth-child(1)").should(
			"have.text",
			"You need to enter your last name"
		);
		cy.contains("You need to enter your last name")
			.should((el) => {
				expect(el).to.have.attr("href", "#teacher-training-adviser-steps-identity-last-name-field-error");
			})
			.click()
			.type("Test_Last_Name");

		cy.contains("You need to enter your email address")
			.should((el) => {
				expect(el).to.have.attr("href", "#teacher-training-adviser-steps-identity-email-field-error");
			})
			.click()
			.type("Test_email@gmail.com");
		cy.clickOnContinueButton();
		cy.get(".govuk-fieldset__heading").should("exist").should("have.text", "Are you returning to teaching?");
	});
	it("It shows the error message to user if he enters invalid date of birth", function () {
		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("Yes");
		cy.selectWhatSubjectIsYourDegree("Biology");
		cy.selectWhichClassIsYourDegree("First class");
		cy.selectStage("Secondary");
		cy.gcseMathsAndEnglish(false);
		cy.retakeGcseMathsAndEnglish(true);
		cy.whichSubjectAreYouInterestedInTeaching("English");
		cy.whenDoYouWantToStartYourTeacherTraining("2022");
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("You need to enter your date of birth");
		cy.get("#teacher-training-adviser-steps-date-of-birth-date-of-birth-error").should(
			"have.text",
			"Error: You need to enter your date of birth"
		);
		cy.get("#teacher-training-adviser-steps-date-of-birth-date-of-birth-field-error").type("31");
		cy.get("#teacher_training_adviser_steps_date_of_birth_date_of_birth_2i").type("3");
		cy.get("#teacher_training_adviser_steps_date_of_birth_date_of_birth_1i").type("1885");
		cy.clickOnContinueButton();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("You must be less than 70 years old");
		cy.get("#teacher-training-adviser-steps-date-of-birth-date-of-birth-error").should(
			"have.text",
			"Error: You must be less than 70 years old"
		);
		teacherTrainingAdviser.getContinueButton().click();
		cy.get("#teacher_training_adviser_steps_date_of_birth_date_of_birth_1i").clear();
		cy.get("#teacher_training_adviser_steps_date_of_birth_date_of_birth_1i").type("2004");
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("You must be 18 years or older to use this service");
		cy.get("#teacher-training-adviser-steps-date-of-birth-date-of-birth-error").should(
			"have.text",
			"Error: You must be 18 years or older to use this service"
		);
		teacherTrainingAdviser.getContinueButton().click();
		cy.get("#teacher_training_adviser_steps_date_of_birth_date_of_birth_1i").clear();
		cy.get("#teacher_training_adviser_steps_date_of_birth_date_of_birth_1i").type("2030");
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyErrorSummaryTitle();
		cy.verifyErrorMessage("You must be 18 years or older to use this service");
		cy.get("#teacher-training-adviser-steps-date-of-birth-date-of-birth-error").should(
			"have.text",
			"Error: You must be 18 years or older to use this service"
		);
	});
	it("It shows the error message to user if he enters invalid email address format", function () {
		let rnum = Math.floor(Math.random() * 10000000 + 1);
		let firstName = "First_" + rnum + "_name";
		let lastName = "Last_" + rnum + "_name";
		teacherTrainingAdviser.getFirstName().type(firstName);
		teacherTrainingAdviser.getLastName().type(lastName);
		teacherTrainingAdviser.getEmailAddress().type("abcxyz");
		teacherTrainingAdviser.getContinueButton().click();
		cy.verifyEmailAddressError();
		cy.enterEmail("$%^&@");
		cy.verifyEmailAddressError();
		cy.enterEmail("$%^&@.com");
		cy.verifyEmailAddressError();
		cy.enterEmail("$%^&@gmail.com");
		cy.verifyEmailAddressError();
	});

	it('It expands "What is a GCSE?" link if user clicks on it', function () {
		cy.enterFirstNameLastNameAndEmail();
		cy.returningToTeaching("No");
		cy.doYouHaveDegree("I'm studying for a degree");
		cy.inWhichYearAreYouStudying("Final year");
		cy.selectWhatSubjectIsYourDegree("Computing");
		cy.whatDegreeClassAreYouPredictedToGet("2:2");
		cy.selectStage("Secondary");
		cy.get(".govuk-details__text").as("gcsedefinition").should("exist").should("not.be.visible");
		cy.contains("What is a GCSE?").click();
		cy.get("@gcsedefinition").should("exist").should("be.visible");
		cy.get(".govuk-details")
			.invoke("attr", "open")
			.then(function (targetLink) {
				expect(targetLink).to.equal("open");
			});
	});

	it("It allows user to submit the feedback", function () {
		cy.goToUrl("teacher_training_adviser/sign_up/completed");
		cy.contains("a", "feedback").invoke("removeAttr", "target").click();
		cy.get(".govuk-heading-l").should("exist").should("include.text", "Give feedback on this service");
		cy.contains("Yes").click();
		cy.contains("Very satisfied").click();
		cy.submitFeedback();
		cy.get(".govuk-panel__title").should("exist").should("include.text", "Thank you for your feedback.");
	});

	it("Verify link responses on thank you page", function () {
		cy.goToUrl("teacher_training_adviser/feedbacks/thank_you");
		cy.verifyLinkResponse("Get your questions answered at an event");
		cy.verifyLinkResponse("ways into teaching");
	});
	it("It shows the error message to user if he submits the feedback form without entering the details", function () {
		cy.goToUrl("teacher_training_adviser/sign_up/completed");
		cy.contains("a", "feedback").invoke("removeAttr", "target").click();
		cy.get(".govuk-heading-l").should("exist").should("include.text", "Give feedback on this service");
		cy.submitFeedback();
		cy.verifyErrorSummaryTitle();
		cy.get("#teacher-training-adviser-feedback-successful-visit-error").should("exist");
		cy.get("#teacher-training-adviser-feedback-rating-error").should("exist");
		cy.contains("Yes").click();
		cy.submitFeedback();
		cy.get("#teacher-training-adviser-feedback-successful-visit-error").should("not.exist");
		cy.get("#teacher-training-adviser-feedback-rating-error").should("exist");
		cy.contains("Very satisfied").click();
		cy.submitFeedback();
		cy.get("#teacher-training-adviser-feedback-rating-error").should("not.exist");
	});
});

describe("Matchback feature", () => {
	const teacherTrainingAdviser = new TeacherTrainingAdviser();
	const mailingListSignUp = new MailingListSignUp();

	beforeEach(function () {
		cy.fixture("tta-signup-test-data.json").then((ttaTestData) => {
			this.ttaTestData = ttaTestData;
		});
		cy.fixture("mailinglist-signup-test-data.json").then((mailingListTestData) => {
			this.mailingListTestData = mailingListTestData;
		});
	});

	it("It allows mailing list sign up if user already signed up for a teacher training adviser service", function () {
		cy.readFile("cypress/fixtures/user.txt").then((value) => {
			let name = value;
			firstName = name.split(":")[0];
			lastName = name.split(":")[1];
			cy.visit("/mailinglist/signup/name", {
				auth: {
					username: Cypress.env("HTTPAUTH_USERNAME"),
					password: Cypress.env("HTTPAUTH_PASSWORD"),
				},
			});
			cy.acceptCookie();
			mailingListSignUp.getFirstName().type(firstName);
			mailingListSignUp.getLastName().type(lastName);
			mailingListSignUp.getEmailAddress().type(this.ttaTestData.email);
			mailingListSignUp.getNextStep().click();
			cy.enterEmailVerificationCode(this.ttaTestData.email, Cypress.env("TTA_USER_EMAIL_API_KEY"));
			mailingListSignUp.getNextStep().click();
			cy.degreeStage("Yes, I already have a degree");
			cy.clickOnNextStepButton();
			cy.howCloseAreYou("I’m not sure and finding out more");
			cy.clickOnNextStepButton();
			mailingListSignUp.getSubjectToTeach().select("English");
			cy.clickOnNextStepButton();
			mailingListSignUp.getPostcode().type("TF3 2BP");
			cy.clickOnNextStepButton();
			cy.acceptPrivacyPolicy();
			mailingListSignUp.getCompleteSignUpButton().click();
			cy.VerifyYouHaveSignedupMessage();
		});
	});

	it('It shows "You’ve signed up" ', function () {
		let rnum = Math.floor(Math.random() * 10000000 + 1);
		let firstName = "First_" + rnum + "_name";
		let lastName = "Last_" + rnum + "_name";
		let name = firstName + ":" + lastName;
		cy.writeFile("cypress/fixtures/user.txt", name);
		cy.visit("/mailinglist/signup/name", {
			auth: {
				username: Cypress.env("HTTPAUTH_USERNAME"),
				password: Cypress.env("HTTPAUTH_PASSWORD"),
			},
		});
		cy.acceptCookie();
		mailingListSignUp.getFirstName().type(firstName);
		mailingListSignUp.getLastName().type(lastName);
		mailingListSignUp.getEmailAddress().type(this.ttaTestData.email);
		mailingListSignUp.getNextStep().click();
		cy.degreeStage("Yes, I already have a degree");
		mailingListSignUp.getNextStep().click();
		cy.howCloseAreYou("I’m fairly sure and exploring my options");
		mailingListSignUp.getNextStep().click();
		mailingListSignUp.getSubjectToTeach().select(this.mailingListTestData.whichSubjectdoYouWantToTeach);
		mailingListSignUp.getNextStep().click();
		mailingListSignUp.getPostcode().type(this.mailingListTestData.postCode);
		mailingListSignUp.getNextStep().click();
		cy.acceptPrivacyPolicy();
		mailingListSignUp.getCompleteSignUpButton().click();
		mailingListSignUp.getContent().should("have.text", "You've signed up");
		cy.wait(6000);
	});

	it("It should allow user to sign up for teacher training adviser service if he already signed up for mailing list", function () {
		cy.readFile("cypress/fixtures/user.txt").then((value) => {
			let name = value;
			firstName = name.split(":")[0];
			lastName = name.split(":")[1];
			cy.visit(Cypress.env("baseurl_tta_flow"), {
				auth: {
					username: Cypress.env("HTTPAUTH_USERNAME"),
					password: Cypress.env("HTTPAUTH_PASSWORD"),
				},
			});
			cy.acceptAllCookies();
			cy.clickOnStartNowButton();
			teacherTrainingAdviser.getFirstName().type(firstName);
			teacherTrainingAdviser.getLastName().type(lastName);
			teacherTrainingAdviser.getEmailAddress().type(this.ttaTestData.email);
			teacherTrainingAdviser.getContinueButton().click();
			cy.enterEmailVerificationCode(this.ttaTestData.email, Cypress.env("TTA_USER_EMAIL_API_KEY"));
			cy.clickOnContinueButton();
			cy.returningToTeaching("Yes");
			cy.havePreviousTeacherReferenceNumber(true);
			cy.enterPreviousTeacherReferenceNumber(23478463);
			cy.selectPreviuosMainSubject("Computing");
			cy.selectSubjectLikeToTeach("Physics");
			cy.enterDateOfBirth("25", "02", "1986");
			cy.doYouLiveInTheUk(true);
			cy.get("#teacher-training-adviser-steps-uk-address-address-postcode-field").should("have.value", "TF3 2BT");
			cy.enterUKCandidateAddress("55", "Hollinswood", "Telford", "TF3 2BT");
			cy.get("#teacher-training-adviser-steps-uk-telephone-telephone-field").type(this.mailingListTestData.phone);
			cy.clickOnContinueButton();
			cy.get(".govuk-heading-l").should("exist").should("have.text", "Check your answers before you continue");
			cy.contains("Name")
				.next()
				.contains(firstName + " " + lastName);
			cy.contains("Date of birth").next().contains("25 02 1986");
			cy.contains("Address").next().contains("55 Hollinswood Telford TF3 2BT");
			cy.contains("Email").next().contains(this.ttaTestData.email);
			cy.contains("Telephone").next().contains(this.mailingListTestData.phone);
			cy.contains("Are you returning to teaching?").next().contains("Yes");
			cy.contains("What is your previous teacher reference number?").next().contains("23478463");
			cy.contains("Which main subject did you previously teach?").next().contains("Computing");
			cy.contains("Which subject would you like to teach if you return to teaching?").next().contains("Physics");
			cy.contains("Where do you live?").next().contains("UK");
			cy.clickOnContinueButton();
			cy.acceptPolicy();
			cy.get(".govuk-panel__title").then(function (signuptext) {
				signuptext = signuptext.text().trim();
				expect(signuptext).to.equal("Thank you  Sign up complete");
			});
		});
	});
});

describe("Hyperlink navigation check : Tests execution date and time : " + new Date(), () => {
	it("verify UK links", () => {
		cy.goToUrl("/");
		cy.verifyUKLink("Scotland", Navlinks.teachInScotland);
		cy.verifyUKLink("Wales", Navlinks.teachInWales);
		cy.verifyUKLink("Northern Ireland", Navlinks.teachInNorthernIreland);
	});
	it('Links through to "online chat", "ways to train", "funding" and "Search for events"', function () {
		cy.goToUrl("teacher_training_adviser/sign_up/completed");
		cy.verifyLinkResponse("online chat");
		cy.verifyLinkResponse("ways to train");
		cy.verifyLinkResponse("funding");
		cy.verifyLinkResponse("Search for events");
	});

	it('Links through to "What did you think of this service? "', function () {
		cy.goToUrl("teacher_training_adviser/sign_up/completed");
		cy.contains("a", "What did you think of this service?").invoke("removeAttr", "target").click();
		cy.get(".govuk-heading-l").should("exist").should("include.text", "Give feedback on this service");
	});
	it('Verify "search for a teaching role in England" link', function () {
		// If UK returner selects subject as "Other" system is navigating to "Get support" page
		cy.goToUrl("teacher_training_adviser/sign_up/subject_not_found");
		cy.contains("a", "search for a teaching role in England").should((link) => {
			expect(link).to.have.attr("href", Navlinks.teachingRoleInEngland);
		});
	});

	it('Links through to "attending an online return to teaching event"', function () {
		// If UK returner selects subject as "Other" system is navigating to "Get support" page
		cy.goToUrl("teacher_training_adviser/sign_up/subject_not_found");
		cy.contains("a", "attending an online return to teaching event")
			.invoke("attr", "href")
			.then(function (val) {
				cy.request({
					url: val,
					method: "GET",
					auth: {
						username: Cypress.env("HTTPAUTH_USERNAME"),
						password: Cypress.env("HTTPAUTH_PASSWORD"),
					},
				});
			})
			.as("linkResponse");
		cy.get("@linkResponse").then((response) => {
			expect(response.status).to.eq(200);
		});
	});
});

describe(`Feature - 404 Not Found unknown_route : ${new Date()}`, () => {
	it('It should show "404	Not Found unknown_route" if the user enters a bad URL', () => {
		cy.visit({
			url: "https://get-teacher-training-adviser-services-test.london.cloudapps.digital/",
			method: "GET",
			failOnStatusCode: false,
		});
		cy.verify404ErrorMessage();
	});
});
