export type NationalIdResult = {
  birthDate: string;
  gender: "Male" | "Female";
};

export function parseEgyptianNationalId(
  value: string,
): NationalIdResult {
  const nationalId = value.trim();

  if (!/^[23]\d{13}$/.test(nationalId)) {
    throw new Error(
      "National ID must contain 14 digits",
    );
  }

  const century =
    nationalId[0] === "2" ? 1900 : 2000;

  const year =
    century +
    Number(nationalId.slice(1, 3));

  const month =
    Number(nationalId.slice(3, 5));

  const day =
    Number(nationalId.slice(5, 7));

  const date =
    new Date(year, month - 1, day);

  const validDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date();

  if (!validDate) {
    throw new Error(
      "National ID contains an invalid birth date",
    );
  }

  const genderDigit =
    Number(nationalId[12]);

  return {
    birthDate: [
      year,
      String(month).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-"),

    gender:
      genderDigit % 2 === 0
        ? "Female"
        : "Male",
  };
}