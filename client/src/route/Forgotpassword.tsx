import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { FormEvent, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import OTPInput from "react-otp-input";
import { Link, useNavigate } from "react-router-dom";

type Inputs = {
  email: string;
  password: string;
};

type PasswordInputs = {
  new_password: string;
};

function Forgotpassword() {
  const navigate = useNavigate();
  const [formdata, setformdata] = useState({
    request_id: null,
    otp: "",
    password: "",
    email: "",
    user: "",
    mobile: "",
    otpverify: false,
  });

  const { register, handleSubmit: handleEmail } = useForm<Inputs>();
  const { register: registerpassword, handleSubmit: handlePassword } =
    useForm<PasswordInputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "http://localhost:5000/resetpassword",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      const response = await axios.request(config);
      console.log(response.data);

      setformdata({
        ...formdata,
        request_id: response.data?.request_id,
        mobile: response.data?.mobile,
        user: response.data?.user,
        email: data.email,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // seterrorMsg(error?.response?.data.message)
    }
  };

  const onSubmitPassword: SubmitHandler<PasswordInputs> = async (
    data: PasswordInputs
  ) => {
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "http://localhost:5000/passwordreset",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          otp: formdata.otp,
          request_id: formdata.request_id,
          password: data.new_password,
          email: formdata.email,
        },
      };

      const response = await axios.request(config);

      setformdata({
        ...formdata,
        request_id: response.data?.request_id,
        mobile: response.data?.mobile,
        user: response.data?.user,
      });

      navigate("/");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // seterrorMsg(error?.response?.data.message)
    }
  };

  const [disableButton, setdisableButton] = useState(true);
  
  const [timer, settimer] = useState(0);

  useEffect(() => {
    let countdown = 60; // 60 seconds
    const countdownInterval = setInterval(() => {
      if (countdown < 0) {
        clearInterval(countdownInterval);
        setdisableButton(false);
        return;
      }
      settimer(countdown);
      countdown--;
    }, 1000);
  }, []);

 

  const mutation = useMutation({
    mutationFn: async () => {
      if(formdata.otp.length<6){
        return
      }
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "http://localhost:5000/resetotpverify",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          otp: formdata.otp,
          request_id: formdata.request_id,
          user: formdata.user,
        },
      };
      const response = await axios.request(config);

      0;
      return response;
    },

    onSuccess: () => {
      // navigate("/")
      setformdata({ ...formdata, otpverify: true });
    },

    onError: (err) => {
      console.log(err);
    },
  });

  const mutationResend = useMutation({
    mutationFn: async () => {

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "http://localhost:5000/resendotp",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          request_id: formdata.request_id,
          user: formdata.user,
        },
      };
      const response = await axios.request(config);

      0;
      return response;
    },

    onSuccess: (data: AxiosResponse) => {
      // navigate("/")
      // console.log(data.data);
      setformdata({ ...formdata, request_id: data?.data?.request_id });

      console.log("reqquest seccess");
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleResend = async (event: FormEvent) => {
    event.preventDefault();
    mutationResend.mutate();
  };

  return (
    <section className="flex justify-center relative">
      <div className="mx-auto max-w-lg px-6 lg:px-8 absolute py-20">
        <div className="rounded-2xl bg-white shadow-xl">
          {formdata.request_id ? (
            !formdata?.otpverify ? (
              <form action="" method="post" onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-16 lg:p-11 p-7 mx-auto">
                  {formdata.mobile && <div>Otp send at  {formdata.mobile}</div>}
                  <OTPInput
                    value={formdata.otp}
                    inputType="number"
                    onChange={(otp) => setformdata({ ...formdata, otp: otp })}
                    numInputs={6}
                    renderSeparator={<span>-</span>}
                    renderInput={(props) => <input {...props} />}
                    inputStyle="border w-full border-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    containerStyle="w-full justify-between gap-3"
                  />

                  <div className="flex flex-col space-y-5">
                    <div>
                      <button className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm">
                        Verify Account
                      </button>
                    </div>

                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                      <p>Didn't recieve code?</p>
                      <div>{timer}</div>
                      <button
                        className="flex flex-row items-center text-blue-600"
                        disabled={disableButton}
                        onClick={handleResend}
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <form
                  onSubmit={handlePassword(onSubmitPassword)}
                  className=" lg:p-11 p-7 mx-auto"
                >
                  <input
                    {...registerpassword("new_password")}
                    type="text"
                    className="w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 rounded-full border-gray-300 border shadow-sm focus:outline-none px-4 mb-6"
                    placeholder="New password"
                  />
                  <button
                    className="w-full h-12 text-white text-center text-base font-semibold leading-6 rounded-full hover:bg-indigo-800 transition-all duration-700 bg-indigo-600 shadow-sm mb-11"
                    type="submit"
                  >
                    Reset password
                  </button>
                </form>
              </>
            )
          ) : (
            <form
              className="lg:p-11 p-7 mx-auto"
              onSubmit={handleEmail(onSubmit)}
            >
              <div className="mb-11">
                <h1 className="text-gray-900 text-center font-manrope text-3xl font-bold leading-10 mb-2">
                  Reset Password
                </h1>
              </div>
              <input
                {...register("email")}
                type="text"
                className="w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 rounded-full border-gray-300 border shadow-sm focus:outline-none px-4 mb-6"
                placeholder="Enter email for password reset"
              />

              {/* {errorMsg && <div>{errorMsg}</div>} */}
              <button className="w-full h-12 text-white text-center text-base font-semibold leading-6 rounded-full hover:bg-indigo-800 transition-all duration-700 bg-indigo-600 shadow-sm mb-11">
                Reset password
              </button>
              <Link
                to="/signup"
                className="flex justify-center text-gray-900 text-base font-medium leading-6"
              >
                {" "}
                Don’t have an account?{" "}
                <span className="text-indigo-600 font-semibold pl-3">
                  {" "}
                  Sign Up
                </span>
              </Link>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default Forgotpassword;
