class MailinglistSignupPage {
	getFirstName() {
		return cy.get("#mailing-list-steps-name-first-name-field");
	}
	getLastName() {
		return cy.get("#mailing-list-steps-name-last-name-field");
	}
	getEmailAddress() {
		return cy.get("#mailing-list-steps-name-email-field");
	}
	getDescribeYourself() {
		return cy.get("#mailing-list-steps-name-current-status-field");
	}
	getDegreeStage() {
		return cy.get("#mailing-list-steps-name-degree-status-id-field");
	}
	getNextStep() {
		return cy.contains("Next Step");
	}
	getSubjectToTeach() {
		return cy.get("#mailing-list-steps-subject-preferred-teaching-subject-id-field");
	}
	getPostcode() {
		return cy.get("#mailing-list-steps-postcode-address-postcode-field");
	}
	getMoreDetails() {
		return cy.get("#mailing-list-steps-contact-more-info-field");
	}
	getInfoRequired() {
		return cy.get("#mailing-list-steps-contact-accept-privacy-policy-1-field");
	}
	getContent() {
		return cy.get(".green");
	}
	getCompleteSignUpButton() {
		return cy.contains("Complete sign up");
	}
	getMailingListSignUpStep() {
		return cy.get("#edit_mailing_list_steps_name_name");
	}
	getErrorSummaryTitle() {
		return cy.get("#error-summary-title");
	}
	getErrorSummaryList() {
		return cy.get(".govuk-error-summary__list");
	}
}
export default MailinglistSignupPage;
