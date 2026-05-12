!macro customInit
  DetailPrint "Sistem gereksinimleri kontrol ediliyor..."
  nsExec::ExecToStack 'java -version'
  Pop $0
  ${If} $0 != 0
    MessageBox MB_YESNO|MB_ICONQUESTION "Lumina Launcher için Java gereklidir. Java indirme sayfasına gitmek ister misiniz?" IDNO nojava
    ExecShell "open" "https://www.java.com/download/"
    nojava:
  ${EndIf}
!macroend