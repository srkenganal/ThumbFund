import {
  IconLayoutDashboard,
  IconArrowAutofitRight,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Next Task",
    icon: IconArrowAutofitRight,
    href: "/utilities/nexttask",
  },
];

export default Menuitems;
