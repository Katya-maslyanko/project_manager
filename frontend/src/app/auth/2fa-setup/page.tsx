"use client";

import { useState } from "react";
import { useSetup2FAMutation, useVerify2FAMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Setup2FA = () => {
  const [setup2FA, { isLoading: isSetupLoading, error: setupError }] = useSetup2FAMutation();
  const [verify2FA, { isLoading: isVerifyLoading, error: verifyError }] = useVerify2FAMutation();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSetup = async () => {
    try {
      const response = await setup2FA().unwrap();
      setQrCode(response.qr_code);
      setDeviceId(response.device_id);
    } catch (err) {
      console.error("Ошибка настройки 2FA:", err);
    }
  };

  const handleVerify = async () => {
    if (!deviceId) return;
    try {
      await verify2FA({ code, device_id: deviceId }).unwrap();
      router.push("/");
    } catch (err) {
      console.error("Ошибка верификации 2FA:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-10">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4">Настройка двухфакторной аутентификации</h2>
        {!qrCode ? (
          <button
            onClick={handleSetup}
            disabled={isSetupLoading}
            className="w-full p-3 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-600 hover:text-white"
          >
            Начать настройку 2FA
          </button>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-500">Отсканируйте QR-код в приложении-аутентификаторе (например, Google Authenticator):</p>
            <Image src={qrCode} alt="QR Code" width={200} height={200} className="mx-auto" />
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="code">
                Код 2FA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Введите код 2FA"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={isVerifyLoading}
              className="w-full p-3 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-600 hover:text-white"
            >
              Подтвердить
            </button>
            {verifyError && <p className="text-red-500">Неверный код</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup2FA;