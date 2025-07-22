import axiosInstance from "@/shared/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const fetchAdmin = async () => {
  const response = await axiosInstance.get("api/logged-in-admin");
  return response.data.user;
};

const useAdmin = () => {
  const {
    data: admin,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin"],
    queryFn: async () => fetchAdmin(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const history = useRouter();

  useEffect(() => {
    if (!isLoading && !admin) {
      history.push("/");
    }
  }, [admin, isLoading]);
  return { admin, isLoading, isError, refetch };
};

export default useAdmin;
