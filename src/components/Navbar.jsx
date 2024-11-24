import React from "react";
import { Sidebar } from "flowbite-react";
import { HiUser, HiOutlineUserGroup, HiAnnotation } from "react-icons/hi";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UploadFile from "./UploadFile";

export default function Navbar() {

  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    setTab(location.pathname);
  }, [location.pathname]);


  return (
      <div className="flex ">
        <div className="w-auto lg:w-56 flex-shrink-0 overflow-hidden">
          <Sidebar>
            <Sidebar.Items>
              <Sidebar.ItemGroup className="flex flex-col gap-1">
                <Link to="/">
                  <Sidebar.Item
                    active={tab === "/"}
                    icon={HiUser}
                    labelColor="dark"
                    as="div"
                  >
                    Invoices
                  </Sidebar.Item>
                </Link>
                <Link to="/products">
                  <Sidebar.Item
                    active={tab === "/products"}
                    icon={HiAnnotation}
                    labelColor="dark"
                    as="div"
                  >
                    Products
                  </Sidebar.Item>
                </Link>
                <Link to="/customers">
                  <Sidebar.Item
                    active={tab === "/customers"}
                    icon={HiOutlineUserGroup}
                    labelColor="dark"
                    as="div"
                  >
                    Customers
                  </Sidebar.Item>
                </Link>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
            <div className="md:hidden">
            <UploadFile />
            </div>
          </Sidebar>
        </div>
        <div className="flex-1 hidden lg:block">
          <UploadFile />
        </div>
      </div>
  );
}
