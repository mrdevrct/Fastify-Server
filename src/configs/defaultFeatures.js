module.exports = [
  { id: 1, feature: "HOME", access: "FULL_ACCESS" },
  { id: 2, feature: "ADD_TICKET", access: "FULL_ACCESS" }, // Changed to FULL_ACCESS for users and non-SUPER_ADMIN
  { id: 3, feature: "VIEW_TICKET", access: "FULL_ACCESS" },
  { id: 4, feature: "EDIT_TICKET", access: "NO_ACCESS" },
  { id: 5, feature: "DELETE_TICKET", access: "NO_ACCESS" },
  { id: 6, feature: "ALL_TICKETS", access: "NO_ACCESS" }, // Only specific admins/users with FULL_ACCESS can view
  { id: 7, feature: "MY_TICKETS", access: "FULL_ACCESS" }, // SUPER_ADMIN has NO_ACCESS
  { id: 7, feature: "MY_ARTICLES", access: "FULL_ACCESS" }, // SUPER_ADMIN has NO_ACCESS
];
