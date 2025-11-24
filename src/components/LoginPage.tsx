import { useState } from "react";
import svgPaths from "../imports/svg-cdz4448v12";

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

function Icon() {
  return (
    <div className="w-[448px] max-w-full flex flex-col items-center py-6 md:py-8 lg:py-10" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Icon">
          <path d={svgPaths.p24a5c0c0} id="Vector" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          <path d={svgPaths.p16a3a570} id="Vector_2" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
        </g>
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <div className="absolute left-[110.41px] size-[16px] top-[16px]" data-name="GoogleIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_1_80)" id="GoogleIcon">
          <path d={svgPaths.p2d50ea80} fill="var(--fill-0, #4285F4)" id="Vector" />
          <path d={svgPaths.p27b6bef1} fill="var(--fill-0, #34A853)" id="Vector_2" />
          <path d={svgPaths.p31229100} fill="var(--fill-0, #FBBC05)" id="Vector_3" />
          <path d={svgPaths.p114c1100} fill="var(--fill-0, #EA4335)" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_1_80">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function FacebookIcon() {
  return (
    <div className="absolute left-[101.93px] size-[16px] top-[16px]" data-name="FacebookIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_1_72)" id="FacebookIcon">
          <path d={svgPaths.p30769300} fill="var(--fill-0, #1877F2)" id="Vector" />
          <path d={svgPaths.p720ee00} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_1_72">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function EmailIcon() {
  return (
    <div className="absolute left-[12px] size-[20px] top-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p24d83580} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pd919a80} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");

  const handleEmailLogin = () => {
    console.log("Login with email:", email);
  };

  const handleGoogleLogin = () => {
    console.log("Login with Google");
  };

  const handleFacebookLogin = () => {
    console.log("Login with Facebook");
  };

  return (
    <div className="shrink-0 w-[448px] h-auto flex flex-col items-center relative">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[32px] items-start relative w-[448px]">
        {/* Header */}
        <div className="h-[100px] relative shrink-0 w-full" data-name="Container">
          <div className="absolute h-[56px] left-[155.13px] top-0 w-[137.734px]" data-name="Container">
            <div className="absolute bg-white box-border content-stretch flex items-center justify-center left-0 rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-[56px] top-0" data-name="Container">
              <Icon />
            </div>
            <div className="absolute h-[40px] left-[68px] top-[8px] w-[69.734px]" data-name="Heading 1">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[40px] left-[35.5px] not-italic text-[36px] text-center text-nowrap text-white top-[0.5px] tracking-[0.3691px] translate-x-[-50%] whitespace-pre">ZUS</p>
            </div>
          </div>
          <div className="absolute h-[28px] left-0 top-[72px] w-[448px]" data-name="Paragraph">
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[223.68px] not-italic text-[18px] text-blue-100 text-center text-nowrap top-0 tracking-[-0.4395px] translate-x-[-50%] whitespace-pre">Kết nối mọi lúc, mọi nơi</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white h-[539px] relative rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] shrink-0 w-full" data-name="Container">
          <div className="absolute h-[32px] left-[32px] top-[32px] w-[384px]" data-name="Heading 2">
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-[192.34px] not-italic text-[#101828] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%] whitespace-pre">Đăng nhập</p>
          </div>
          
          <div className="absolute h-[24px] left-[32px] top-[72px] w-[384px]" data-name="Paragraph">
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[191.55px] not-italic text-[#4a5565] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%] whitespace-pre">Chào mừng bạn quay lại với Zus</p>
          </div>

          {/* Social Login Buttons */}
          <div className="absolute content-stretch flex flex-col gap-[12px] h-[108px] items-start left-[32px] top-[120px] w-[384px]" data-name="Container">
            <button 
              onClick={handleGoogleLogin}
              className="bg-white h-[48px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-gray-50 transition-colors" 
              data-name="Button"
            >
              <div aria-hidden="true" className="absolute border-2 border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <GoogleIcon />
              <div className="absolute h-[20px] left-[146.41px] top-[14px] w-[127.188px]" data-name="LoginPage">
                <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#364153] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Tiếp tục với Google</p>
              </div>
            </button>

            <button 
              onClick={handleFacebookLogin}
              className="bg-white h-[48px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-gray-50 transition-colors" 
              data-name="Button"
            >
              <div aria-hidden="true" className="absolute border-2 border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <FacebookIcon />
              <div className="absolute h-[20px] left-[137.93px] top-[14px] w-[144.133px]" data-name="LoginPage">
                <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#364153] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Tiếp tục với Facebook</p>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="absolute h-px left-[32px] top-[252px] w-[384px]" data-name="Container">
            <div className="absolute bg-[#d1d5dc] h-px left-0 top-0 w-[384px]" data-name="Primitive.div" />
            <div className="absolute bg-white h-[20px] left-[164.27px] top-[-9.5px] w-[55.469px]" data-name="Text">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">hoặc</p>
            </div>
          </div>

          {/* Email Form */}
          <div className="absolute content-stretch flex flex-col gap-[24px] h-[166px] items-start left-[32px] top-[277px] w-[384px]" data-name="Form">
            <div className="content-stretch flex flex-col gap-[8px] h-[94px] items-start relative shrink-0 w-full" data-name="Container">
              <div className="h-[14px] relative shrink-0 w-full" data-name="Primitive.label">
                <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[14px] left-0 not-italic text-[#364153] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Email</p>
              </div>
              
              <div className="h-[48px] relative shrink-0 w-full" data-name="Container">
                <div className="absolute bg-[#f3f3f5] h-[48px] left-0 rounded-[8px] top-0 w-[384px]" data-name="Input">
                  <div className="box-border content-stretch flex h-[48px] items-center overflow-clip pl-[40px] pr-[12px] py-[4px] relative rounded-[inherit] w-[384px]">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre bg-transparent border-none outline-none w-full placeholder:text-[#717182]"
                    />
                  </div>
                  <div aria-hidden="true" className="absolute border-2 border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[8px]" />
                </div>
                <EmailIcon />
              </div>
              
              <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Chúng tôi sẽ gửi mã xác thực đến email của bạn</p>
              </div>
            </div>

            <button 
              onClick={handleEmailLogin}
              className="bg-[#155dfc] h-[48px] relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-[#1247d9] transition-colors" 
              data-name="Button"
            >
              <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[134.17px] not-italic text-[14px] text-nowrap text-white top-[14.5px] tracking-[-0.1504px] whitespace-pre">Tiếp tục với Email</p>
            </button>
          </div>

          {/* Terms */}
          <div className="absolute h-[40px] left-[32px] top-[467px] w-[384px]" data-name="Paragraph">
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[130.62px] not-italic text-[#4a5565] text-[14px] text-center top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] w-[247px]">Bằng cách đăng nhập, bạn đồng ý với</p>
            <div className="absolute content-stretch flex h-[16.5px] items-start left-[253.67px] top-[1.5px] w-[123.211px]" data-name="Link">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#155dfc] text-[14px] text-center text-nowrap tracking-[-0.1504px] whitespace-pre cursor-pointer hover:underline">Điều khoản dịch vụ</p>
            </div>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[128.26px] not-italic text-[#4a5565] text-[14px] text-center top-[20.5px] tracking-[-0.1504px] translate-x-[-50%] w-[19px]">và</p>
            <div className="absolute content-stretch flex h-[16.5px] items-start left-[137.29px] top-[21.5px] w-[127.945px]" data-name="Link">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#155dfc] text-[14px] text-center text-nowrap tracking-[-0.1504px] whitespace-pre cursor-pointer hover:underline">Chính sách bảo mật</p>
            </div>
          </div>
        </div>

        {/* Register Link */}
        <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[172.92px] not-italic text-[16px] text-center text-white top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%] w-[143px]">Chưa có tài khoản?</p>
          <button 
            onClick={onSwitchToRegister}
            className="absolute content-stretch flex h-[19px] items-start left-[243.64px] top-[2.5px] w-[102.93px] cursor-pointer" 
            data-name="Link"
          >
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-nowrap text-white tracking-[-0.3125px] whitespace-pre hover:underline">Đăng ký ngay</p>
          </button>
        </div>
      </div>
    </div>
  );
}
