// src/lib/constants.ts
// Class options for the signup dropdown

export const CLASS_OPTIONS = [
    // Class 10
    ...Array.from({ length: 12 }, (_, i) => ({
        value: `10-${i + 1}`,
        label: `Kelas 10-${i + 1}`,
        grade: 10,
    })),
    // Class 11
    ...Array.from({ length: 12 }, (_, i) => ({
        value: `11-${i + 1}`,
        label: `Kelas 11-${i + 1}`,
        grade: 11,
    })),
    // Class 12
    ...Array.from({ length: 12 }, (_, i) => ({
        value: `12-${i + 1}`,
        label: `Kelas 12-${i + 1}`,
        grade: 12,
    })),
];

export const GRADE_OPTIONS = [
    { value: "all", label: "Semua Kelas" },
    { value: "10", label: "Kelas 10" },
    { value: "11", label: "Kelas 11" },
    { value: "12", label: "Kelas 12" },
];
