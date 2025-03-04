/// <reference types='Cypress' />
import Homepage from "../../support/pageobjects/Homepage";
import Navlinks from "../../support/pageobjects/Navlinks";

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

describe(`Home page tests : Tests execution date and time : ${new Date()}`, () => {
	const homePage = new Homepage();
	beforeEach(() => {
		cy.logintoApp();
	});

	it('It hides the COVID-19 message if user clicks on "Hide this message" link', () => {
		cy.contains("Hide this message").as("link").should("be.visible");
		cy.get(".covid").as("covidMessage").should("be.visible");
		cy.get("@link").click();
		cy.get("@link").should("not.be.visible");
		cy.get("@covidMessage").should("not.be.visible");
	});

	it("Verify social media links", () => {
		cy.verifySocialMediaLink(0, Navlinks.facebook);
		cy.verifySocialMediaLink(1, Navlinks.instagram);
		cy.verifySocialMediaLink(2, Navlinks.linkedin);
		cy.verifySocialMediaLink(3, Navlinks.twitter);
		cy.verifySocialMediaLink(4, Navlinks.youtube);
	});

	it("Has no detectable a11y violations on load (filtering to only include critical impact violations)", () => {
		// Test on initial load, only report and assert for critical impact items
		cy.checkA11y(null, {
			includedImpacts: ["critical"],
		});
	});

	it('Links through to "Get an adviser"', () => {
		homePage
			.getGetAnAdviserLink()
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.getAnAdviser);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.getAnAdviser);
	});

	it('Links through to "Read teachers stories"', () => {
		cy.contains("Read teachers' stories")
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.myStoryIntoTeaching);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.myStoryIntoTeaching);
	});

	it('Links through to "Teachers salaries"', () => {
		cy.contains("Teachers' salaries")
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.salariesAndBenefits);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.salariesAndBenefits);
	});

	it('Links through to "How to become a teacher"', () => {
		cy.contains("How to become a teacher")
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.stepsToBecomeATeacher);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.stepsToBecomeATeacher);
	});

	it('Links through to "Explore ways to train"', () => {
		cy.contains("Explore ways to train")
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.waysToTrain);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.waysToTrain);
	});

	it('Links through to "Find your funding options"', () => {
		cy.contains("Find your funding options")
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.fundingYourTraining);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.fundingYourTraining);
	});
	it('Links through to "Returning to teaching"', () => {
		cy.contains("Returning to teaching")
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.returningToTeaching);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.returningToTeaching);
	});
	it('Links through to "Go to an event"', () => {
		cy.contains("Go to an event")
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.events);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.events);
	});

	it('Links through to "Sign up for personalised updates"', () => {
		cy.contains("Sign up for personalised updates")
			.should((el) => {
				expect(el).to.have.attr("href", Navlinks.mailingListSignup);
			})
			.click();

		cy.location("pathname").should("equal", Navlinks.mailingListSignup);
	});

	/*it("Validate search icon functionality", () => {
		cy.get(".navbar__desktop__search").click();
		cy.get(".searchbox__close").should("be.visible");
		cy.get("#searchbox__input").should("exist").type("Salaries and benefits");
		cy.get(".search-result")
			.find("h3")
			.eq(0)
			.then(function (searchResult) {
				cy.contains(searchResult.text()).click();
			});
		cy.get(".searchbox__close").should("not.be.visible");
		cy.location("pathname").should("equal", Navlinks.salariesAndBenefits);
	});*/
});

describe(`Feature - 404 Not Found unknown_route : ${new Date()}`, () => {
	it('It should show "404	Not Found unknown_route" if the user enters a bad URL', () => {
		cy.visit({
			url: "https://get-into-teaching-apps-test.london.cloudapps.digital/",
			method: "GET",
			failOnStatusCode: false,
		});
		cy.verify404ErrorMessage();
	});
});
