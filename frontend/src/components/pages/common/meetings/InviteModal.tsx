import { useState } from "react";
import { X, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { socketService } from "@/services/socket";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
function InviteModal({ open, onOpenChange, roomId, currentUserId }: any) {
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  console.log(roomId)
  // thêm email vào danh sách chờ
  const addEmail = () => {
    const email = emailInput.trim(); // xóa kí tự thừa
    if (email && email.includes("@") && !emailList.includes(email)) {
      setEmailList([...emailList, email]);
      setEmailInput("");
    }
  };

  const removeEmail = (emailRemove: string) => {
    setEmailList(emailList.filter((e) => e !== emailRemove));
  };

  // gửi lời mời qua socket
  const handleInvite = () => {
    // 1. Tạo danh sách 
    let  finalEmails = [...emailList]; 
    // xử lí lại nếu ô input mà chưa bấm dấu cộng thì hàng ở dưới vẫn vào 
    const pendingEmail = emailInput.trim(); 
    if(pendingEmail && pendingEmail.includes('@') && !finalEmails.includes(pendingEmail)){
      finalEmails.push(pendingEmail);
    }
    if(finalEmails.length===0) return; 
    // 2. Gọi socket 
    console.log(roomId)
    socketService.inviteByEmail(roomId, currentUserId, finalEmails); 
    toast.success(`Đã gửi lời mời tới ${finalEmails.length} người`);
    // 3. Reset lại form 
    setEmailInput(""); 
    setEmailList([]); 
    onOpenChange(false);
  };
  // GIAO DIỆN
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Mời thành viên</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nhập email người nhận..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEmail()}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              onClick={addEmail}
              variant="outline"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {emailList.map((email) => (
              <Badge
                key={email}
                variant="secondary"
                className="pl-3 pr-1 py-1 gap-1"
              >
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <DialogFooter>
            <Button 
                onClick={handleInvite}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg"
                // Chỉ được nhấn khi danh sách nhiều hơn 0
                disabled={emailList.length === 0 && !emailInput.includes("@")}
            >
                Gửi lời mời
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InviteModal;
