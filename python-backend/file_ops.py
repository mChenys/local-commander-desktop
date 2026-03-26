"""
文件操作工具 - 简化版本
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any


class FileOps:
    """文件操作类"""

    def __init__(self, project_root: Optional[Path] = None):
        self.project_root = project_root or Path.cwd()

    def set_project_root(self, root: Path):
        """设置项目根目录"""
        self.project_root = root

    def read_file(self, file_path: Path, max_lines: int = 100) -> str:
        """读取文件内容"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = []
                for i, line in enumerate(f):
                    if i >= max_lines:
                        break
                    lines.append(line)
                return ''.join(lines)
        except Exception as e:
            return f"Error reading file: {e}"

    def list_files(self, extensions: List[str] = None) -> List[Path]:
        """列出项目文件"""
        files = []
        for ext in (extensions or ['.py', '.ts', '.tsx', '.js', '.jsx', '.swift', '.kt']):
            files.extend(self.project_root.rglob(f'*{ext}'))
        return files[:100]  # 限制数量

    def get_file_info(self, file_path: Path) -> Dict[str, Any]:
        """获取文件信息"""
        try:
            stat = file_path.stat()
            return {
                'path': str(file_path),
                'size': stat.st_size,
                'modified': stat.st_mtime,
            }
        except Exception:
            return {}


# 单例实例
_file_ops_instance = None


def get_file_ops() -> FileOps:
    """获取文件操作单例"""
    global _file_ops_instance
    if _file_ops_instance is None:
        _file_ops_instance = FileOps()
    return _file_ops_instance
