<script>
    const chatBox = document.getElementById('chat-box');
    const input = document.getElementById('user-input');

    // Hàm xử lý gửi tin nhắn
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return; // Không gửi nếu ô nhập trống

        // 1. Hiển thị tin nhắn của người dùng
        chatBox.innerHTML += `
            <div class="flex gap-3 flex-row-reverse">
                <div class="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-[10px] flex-shrink-0">YOU</div>
                <div class="bg-yellow-400 text-black p-4 chat-bubble text-sm font-medium">
                    ${text}
                </div>
            </div>`;
        
        input.value = ''; // Xóa ô nhập liệu ngay sau khi gửi
        chatBox.scrollTop = chatBox.scrollHeight;

        // 2. Hiển thị trạng thái đang xử lý
        const thinkingId = "bitsy-" + Date.now();
        chatBox.innerHTML += `
            <div class="flex gap-3" id="${thinkingId}">
                <img src="Bitsy.png" class="w-8 h-8 rounded-full flex-shrink-0">
                <div class="bg-[#111] border border-gray-800 p-4 chat-bubble text-sm text-gray-400 italic">
                    Bitsy is thinking...
                </div>
            </div>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            // 3. Gọi API xử lý
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = await response.json();

            // 4. Cập nhật câu trả lời từ AI
            const responseDiv = document.getElementById(thinkingId).querySelector('.chat-bubble');
            responseDiv.classList.remove('italic', 'text-gray-400');
            responseDiv.innerHTML = `
                <p class="text-yellow-500 font-bold text-[10px] uppercase mb-1">Bitsy</p>
                ${data.reply || data.error}
            `;
        } catch (error) {
            const responseDiv = document.getElementById(thinkingId).querySelector('.chat-bubble');
            responseDiv.innerHTML = `<p class="text-red-500 text-xs">Error: Connection lost.</p>`;
        }
        
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // LẮNG NGHE SỰ KIỆN PHÍM ENTER
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Ngăn việc xuống dòng nếu có
            sendMessage();
        }
    });
</script>
