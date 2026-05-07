import { describe, expect, it } from "vitest";
import { validateRegistration } from "./validators";
import type { IRegistrationForm } from "./registration-form.types";

const validRegistration: IRegistrationForm = {
  name: "Pinder-White",
  prenom: "Max",
  email: "max.pinder-white@example.com",
  dateNaissance: "1998-04-12",
  ville: "Lyon",
  codePostal: "69001",
};

const today = new Date("2026-05-07T12:00:00.000Z");

function validate(overrides: Partial<IRegistrationForm> = {}) {
  return validateRegistration({ ...validRegistration, ...overrides }, today);
}

describe("validateRegistration", () => {
  it("returns no errors for a valid registration", () => {
    expect(validate()).toEqual({});
  });

  it("accepts trimmed values, accents, apostrophes, spaces, and hyphens in text fields", () => {
    expect(
      validate({
        name: "  L'Écuyer-Martin  ",
        prenom: "Anne Marie",
        email: "  anne.marie@example.fr  ",
        ville: "Saint-Étienne",
        codePostal: " 42000 ",
      }),
    ).toEqual({});
  });

  it("reports invalid text fields", () => {
    expect(
      validate({
        name: "Dupont2",
        prenom: "",
        ville: "Paris!",
      }),
    ).toMatchObject({
      name: "Le nom est invalide.",
      prenom: "Le prénom est invalide.",
      ville: "La ville est invalide.",
    });
  });

  it("reports an invalid email", () => {
    expect(validate({ email: "elise.dupont.example.com" })).toEqual({
      email: "L'email est invalide.",
    });
  });

  it("reports invalid birth dates and users younger than 18", () => {
    expect(validate({ dateNaissance: "not-a-date" })).toEqual({
      dateNaissance: "Vous devez avoir au moins 18 ans.",
    });

    expect(validate({ dateNaissance: "2008-05-08" })).toEqual({
      dateNaissance: "Vous devez avoir au moins 18 ans.",
    });
  });

  it("accepts users on and after their 18th birthday", () => {
    expect(validate({ dateNaissance: "2008-05-07" })).toEqual({});
    expect(validate({ dateNaissance: "2008-05-06" })).toEqual({});
  });

  it("reports postal codes that are not exactly five digits", () => {
    expect(validate({ codePostal: "7500" })).toEqual({
      codePostal: "Le code postal doit contenir 5 chiffres.",
    });

    expect(validate({ codePostal: "7500A" })).toEqual({
      codePostal: "Le code postal doit contenir 5 chiffres.",
    });
  });
});
