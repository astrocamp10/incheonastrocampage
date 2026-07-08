window.INCHEON_ASTRO_AVAILABILITY_KEY = "incheonastroAvailabilityV1";
window.INCHEON_ASTRO_AVAILABILITY_DATA_URL = "availability.data";
window.INCHEON_ASTRO_AVAILABILITY_SAVE_URL = "save-availability.php";

window.INCHEON_ASTRO_DEFAULT_AVAILABILITY = {
  days: ["화", "수", "목", "금", "토"],
  times: ["7시", "9시"],
  weeks: [
    {
      label: "1주차",
      slots: {
        "7시": ["wait", "open", "wait", "wait", "wait"],
        "9시": ["wait", "open", "wait", "wait", "wait"]
      }
    },
    {
      label: "2주차",
      slots: {
        "7시": ["wait", "open", "wait", "wait", "wait"],
        "9시": ["wait", "wait", "open", "wait", "wait"]
      }
    },
    {
      label: "3주차",
      slots: {
        "7시": ["open", "wait", "wait", "wait", "wait"],
        "9시": ["open", "wait", "wait", "wait", "wait"]
      }
    },
    {
      label: "4주차",
      slots: {
        "7시": ["open", "wait", "wait", "wait", "wait"],
        "9시": ["open", "open", "open", "wait", "wait"]
      }
    }
  ]
};
